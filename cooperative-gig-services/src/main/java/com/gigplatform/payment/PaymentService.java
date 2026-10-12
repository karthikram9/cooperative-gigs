package com.gigplatform.payment;

import com.gigplatform.exception.BadRequestException;
import com.gigplatform.exception.ResourceNotFoundException;
import com.gigplatform.exception.UnauthorizedException;
import com.gigplatform.job.Job;
import com.gigplatform.job.JobRepository;
import com.gigplatform.job.JobStatus;
import com.gigplatform.payment.dto.PaymentRequest;
import com.gigplatform.payment.dto.PaymentResponse;
import com.gigplatform.user.User;
import com.gigplatform.user.UserRole;
import com.gigplatform.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final JobRepository jobRepository;
    private final UserService userService;

    public PaymentService(
            PaymentRepository paymentRepository,
            JobRepository jobRepository,
            UserService userService
    ) {
        this.paymentRepository = paymentRepository;
        this.jobRepository = jobRepository;
        this.userService = userService;
    }

    public PaymentResponse create(String email, PaymentRequest request) {
        User customer = getUser(email);
        Job job = getJob(request.jobId());
        verifyCustomerOwnsJob(customer, job);

        if (job.getStatus() != JobStatus.COMPLETED) {
            throw new BadRequestException("Payment can only be created for a completed job");
        }
        if (paymentRepository.findByJobId(job.getId()).isPresent()) {
            throw new BadRequestException("Payment already exists for this job");
        }
        if (job.getBooking().getPrice() != null
                && request.amount().compareTo(job.getBooking().getPrice()) != 0) {
            throw new BadRequestException("Payment amount must match the booking price");
        }

        PaymentLedger payment = new PaymentLedger();
        payment.setJob(job);
        payment.setBooking(job.getBooking());
        payment.setAmount(request.amount());
        payment.setPaymentMethod(request.paymentMethod().trim());
        payment.setTransactionReference("PAY-" + UUID.randomUUID());
        payment.setPaymentStatus(PaymentStatus.PENDING);
        return PaymentResponse.fromPayment(paymentRepository.save(payment));
    }

    @Transactional(readOnly = true)
    public PaymentResponse getById(String email, Long paymentId) {
        PaymentLedger payment = getPayment(paymentId);
        verifyCanView(getUser(email), payment);
        return PaymentResponse.fromPayment(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getMyPayments(String email) {
        User customer = getUser(email);
        if (customer.getRole() != UserRole.CUSTOMER) {
            throw new UnauthorizedException("Only customers can view their payments");
        }
        return paymentRepository.findAllByBookingCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream()
                .map(PaymentResponse::fromPayment)
                .toList();
    }

    @Transactional(readOnly = true)
    public PaymentResponse getByJobId(String email, Long jobId) {
        getJob(jobId);
        PaymentLedger payment = paymentRepository.findByJobId(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for job: " + jobId));
        verifyCanView(getUser(email), payment);
        return PaymentResponse.fromPayment(payment);
    }

    public PaymentResponse pay(String email, Long paymentId) {
        PaymentLedger payment = getPayment(paymentId);
        User customer = getUser(email);
        verifyCustomerOwnsPayment(customer, payment);
        requireStatus(payment, PaymentStatus.PENDING);
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        return PaymentResponse.fromPayment(paymentRepository.save(payment));
    }

    public PaymentResponse fail(String email, Long paymentId) {
        PaymentLedger payment = getPayment(paymentId);
        User user = getUser(email);
        if (user.getRole() != UserRole.ADMIN) {
            verifyCustomerOwnsPayment(user, payment);
        }
        requireStatus(payment, PaymentStatus.PENDING);
        payment.setPaymentStatus(PaymentStatus.FAILED);
        return PaymentResponse.fromPayment(paymentRepository.save(payment));
    }

    public PaymentResponse refund(String email, Long paymentId) {
        User admin = getUser(email);
        if (admin.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedException("Only administrators can refund payments");
        }
        PaymentLedger payment = getPayment(paymentId);
        requireStatus(payment, PaymentStatus.SUCCESS);
        payment.setPaymentStatus(PaymentStatus.REFUNDED);
        return PaymentResponse.fromPayment(paymentRepository.save(payment));
    }

    private PaymentLedger getPayment(Long paymentId) {
        return paymentRepository.findDetailedById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));
    }

    private Job getJob(Long jobId) {
        return jobRepository.findDetailedById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));
    }

    private User getUser(String email) {
        return userService.getUserByEmail(email);
    }

    private void verifyCustomerOwnsJob(User customer, Job job) {
        if (customer.getRole() != UserRole.CUSTOMER
                || !customer.getId().equals(job.getBooking().getCustomer().getId())) {
            throw new UnauthorizedException("You are not authorized to pay for this job");
        }
    }

    private void verifyCustomerOwnsPayment(User customer, PaymentLedger payment) {
        if (customer.getRole() != UserRole.CUSTOMER
                || !customer.getId().equals(payment.getBooking().getCustomer().getId())) {
            throw new UnauthorizedException("You are not authorized to access this payment");
        }
    }

    private void verifyCanView(User user, PaymentLedger payment) {
        boolean admin = user.getRole() == UserRole.ADMIN;
        boolean customer = user.getId().equals(payment.getBooking().getCustomer().getId());
        boolean worker = user.getId().equals(payment.getJob().getWorker().getUser().getId());
        if (!admin && !customer && !worker) {
            throw new UnauthorizedException("You are not authorized to access this payment");
        }
    }

    private void requireStatus(PaymentLedger payment, PaymentStatus expected) {
        if (payment.getPaymentStatus() != expected) {
            throw new BadRequestException(
                    "Payment is not in a valid state for this operation: " + payment.getPaymentStatus()
            );
        }
    }
}
