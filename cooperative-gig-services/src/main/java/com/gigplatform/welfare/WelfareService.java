package com.gigplatform.welfare;

import com.gigplatform.exception.BadRequestException;
import com.gigplatform.exception.ResourceNotFoundException;
import com.gigplatform.exception.UnauthorizedException;
import com.gigplatform.job.Job;
import com.gigplatform.payment.PaymentLedger;
import com.gigplatform.payment.PaymentRepository;
import com.gigplatform.payment.PaymentStatus;
import com.gigplatform.user.User;
import com.gigplatform.user.UserRole;
import com.gigplatform.user.UserService;
import com.gigplatform.worker.WorkerProfile;
import com.gigplatform.worker.WorkerRepository;
import com.gigplatform.welfare.dto.WelfareResponse;
import com.gigplatform.welfare.dto.WelfareSummaryResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class WelfareService {

    private final WelfareRepository welfareRepository;
    private final PaymentRepository paymentRepository;
    private final UserService userService;
    private final WorkerRepository workerRepository;
    private final BigDecimal contributionPercentage;

    public WelfareService(
            WelfareRepository welfareRepository,
            PaymentRepository paymentRepository,
            UserService userService,
            WorkerRepository workerRepository,
            @Value("${welfare.contribution-percentage:5}") BigDecimal contributionPercentage
    ) {
        if (contributionPercentage == null || contributionPercentage.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Welfare contribution percentage must be greater than zero");
        }
        this.welfareRepository = welfareRepository;
        this.paymentRepository = paymentRepository;
        this.userService = userService;
        this.workerRepository = workerRepository;
        this.contributionPercentage = contributionPercentage;
    }

    public WelfareResponse create(String email, Long paymentId) {
        User user = userService.getUserByEmail(email);
        PaymentLedger payment = getPayment(paymentId);
        verifyCreationAccess(user, payment);

        if (payment.getPaymentStatus() != PaymentStatus.SUCCESS) {
            throw new BadRequestException("Payment must be successful before welfare contribution can be created");
        }
        if (payment.getJob() == null || payment.getJob().getWorker() == null) {
            throw new ResourceNotFoundException("Job or worker not found for payment");
        }
        if (welfareRepository.existsByPaymentId(paymentId)) {
            throw new BadRequestException("Welfare contribution already exists for this payment");
        }

        BigDecimal amount = payment.getAmount()
                .multiply(contributionPercentage)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Contribution amount must be greater than zero");
        }

        Job job = payment.getJob();
        WelfareTransaction transaction = new WelfareTransaction();
        transaction.setPayment(payment);
        transaction.setJob(job);
        transaction.setWorker(job.getWorker());
        transaction.setContributionAmount(amount);
        transaction.setContributionPercentage(contributionPercentage.setScale(2, RoundingMode.HALF_UP));
        transaction.setTransactionReference("WEL-" + UUID.randomUUID());
        return WelfareResponse.fromTransaction(welfareRepository.save(transaction));
    }

    @Transactional(readOnly = true)
    public WelfareResponse getById(String email, Long id) {
        WelfareTransaction transaction = getTransaction(id);
        verifyViewAccess(userService.getUserByEmail(email), transaction);
        return WelfareResponse.fromTransaction(transaction);
    }

    @Transactional(readOnly = true)
    public List<WelfareResponse> getMine(String email) {
        User user = userService.getUserByEmail(email);
        if (user.getRole() == UserRole.ADMIN) {
            return welfareRepository.findAll().stream()
                    .map(WelfareResponse::fromTransaction)
                    .toList();
        }
        if (user.getRole() != UserRole.WORKER) {
            throw new UnauthorizedException("Only workers can view their welfare contributions");
        }
        WorkerProfile worker = getWorkerProfile(user);
        return welfareRepository.findByWorkerIdOrderByCreatedAtDesc(worker.getId()).stream()
                .map(WelfareResponse::fromTransaction)
                .toList();
    }

    @Transactional(readOnly = true)
    public WelfareSummaryResponse getMySummary(String email) {
        User user = userService.getUserByEmail(email);
        List<WelfareTransaction> transactions;
        if (user.getRole() == UserRole.ADMIN) {
            transactions = welfareRepository.findAll();
        } else if (user.getRole() == UserRole.WORKER) {
            transactions = welfareRepository.findByWorkerIdOrderByCreatedAtDesc(
                    getWorkerProfile(user).getId()
            );
        } else {
            throw new UnauthorizedException("Only workers or administrators can view welfare summaries");
        }

        BigDecimal total = transactions.stream()
                .map(WelfareTransaction::getContributionAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
        return new WelfareSummaryResponse(total, transactions.size());
    }

    private PaymentLedger getPayment(Long paymentId) {
        return paymentRepository.findDetailedById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));
    }

    private WelfareTransaction getTransaction(Long id) {
        return welfareRepository.findDetailedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Welfare transaction not found with id: " + id));
    }

    private void verifyCreationAccess(User user, PaymentLedger payment) {
        boolean admin = user.getRole() == UserRole.ADMIN;
        boolean customer = user.getRole() == UserRole.CUSTOMER
                && user.getId().equals(payment.getBooking().getCustomer().getId());
        if (!admin && !customer) {
            throw new UnauthorizedException("You are not authorized to create this welfare contribution");
        }
    }

    private void verifyViewAccess(User user, WelfareTransaction transaction) {
        boolean admin = user.getRole() == UserRole.ADMIN;
        boolean worker = user.getRole() == UserRole.WORKER
                && user.getId().equals(transaction.getWorker().getUser().getId());
        if (!admin && !worker) {
            throw new UnauthorizedException("You are not authorized to access this welfare transaction");
        }
    }

    private WorkerProfile getWorkerProfile(User user) {
        return workerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));
    }
}
