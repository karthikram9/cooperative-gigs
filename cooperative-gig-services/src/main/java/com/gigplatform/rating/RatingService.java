package com.gigplatform.rating;

import com.gigplatform.exception.BadRequestException;
import com.gigplatform.exception.ResourceNotFoundException;
import com.gigplatform.exception.UnauthorizedException;
import com.gigplatform.job.Job;
import com.gigplatform.job.JobRepository;
import com.gigplatform.job.JobStatus;
import com.gigplatform.payment.PaymentLedger;
import com.gigplatform.payment.PaymentRepository;
import com.gigplatform.payment.PaymentStatus;
import com.gigplatform.rating.dto.RatingRequest;
import com.gigplatform.rating.dto.RatingResponse;
import com.gigplatform.rating.dto.RatingSummaryResponse;
import com.gigplatform.user.User;
import com.gigplatform.user.UserRole;
import com.gigplatform.user.UserService;
import com.gigplatform.worker.WorkerProfile;
import com.gigplatform.worker.WorkerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@Transactional
public class RatingService {

    private final RatingRepository ratingRepository;
    private final JobRepository jobRepository;
    private final PaymentRepository paymentRepository;
    private final WorkerRepository workerRepository;
    private final UserService userService;

    public RatingService(
            RatingRepository ratingRepository,
            JobRepository jobRepository,
            PaymentRepository paymentRepository,
            WorkerRepository workerRepository,
            UserService userService
    ) {
        this.ratingRepository = ratingRepository;
        this.jobRepository = jobRepository;
        this.paymentRepository = paymentRepository;
        this.workerRepository = workerRepository;
        this.userService = userService;
    }

    public RatingResponse create(String email, RatingRequest request) {
        User customer = getCustomer(email);
        Job job = getJob(request.jobId());
        if (!job.getBooking().getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedException("You are not authorized to rate this job");
        }
        if (job.getStatus() != JobStatus.COMPLETED) {
            throw new BadRequestException("Job must be completed before rating");
        }
        PaymentLedger payment = paymentRepository.findByJobId(job.getId())
                .orElseThrow(() -> new BadRequestException("Payment must be successful before rating"));
        if (payment.getPaymentStatus() != PaymentStatus.SUCCESS) {
            throw new BadRequestException("Payment must be successful before rating");
        }
        if (ratingRepository.existsByJobId(job.getId())) {
            throw new BadRequestException("You have already rated this job");
        }

        Rating rating = new Rating();
        rating.setJob(job);
        rating.setBooking(job.getBooking());
        rating.setCustomer(customer);
        rating.setWorker(job.getWorker());
        applyValues(rating, request);
        return RatingResponse.fromRating(ratingRepository.save(rating));
    }

    @Transactional(readOnly = true)
    public RatingResponse getById(String email, Long ratingId) {
        Rating rating = getRating(ratingId);
        verifyViewAccess(userService.getUserByEmail(email), rating);
        return RatingResponse.fromRating(rating);
    }

    public RatingResponse update(String email, Long ratingId, RatingRequest request) {
        User customer = getCustomer(email);
        Rating rating = getRating(ratingId);
        if (!rating.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedException("You are not authorized to update this rating");
        }
        if (!rating.getJob().getId().equals(request.jobId())) {
            throw new BadRequestException("Rating job cannot be changed");
        }
        applyValues(rating, request);
        return RatingResponse.fromRating(ratingRepository.save(rating));
    }

    public void delete(String email, Long ratingId) {
        User user = userService.getUserByEmail(email);
        Rating rating = getRating(ratingId);
        if (user.getRole() != UserRole.ADMIN && !rating.getCustomer().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this rating");
        }
        ratingRepository.delete(rating);
    }

    @Transactional(readOnly = true)
    public List<RatingResponse> getWorkerRatings(Long workerId) {
        getWorker(workerId);
        return ratingRepository.findAllByWorkerIdOrderByCreatedAtDesc(workerId)
                .stream()
                .map(RatingResponse::fromRating)
                .toList();
    }

    @Transactional(readOnly = true)
    public RatingSummaryResponse getWorkerSummary(Long workerId) {
        getWorker(workerId);
        List<Rating> ratings = ratingRepository.findAllByWorkerIdOrderByCreatedAtDesc(workerId);
        BigDecimal average = ratings.isEmpty()
                ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                : ratings.stream()
                        .map(rating -> BigDecimal.valueOf(rating.getRating()))
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(ratings.size()), 2, RoundingMode.HALF_UP);
        return new RatingSummaryResponse(workerId, average, ratings.size());
    }

    private void applyValues(Rating rating, RatingRequest request) {
        rating.setRating(request.rating());
        rating.setReview(request.review() == null || request.review().isBlank()
                ? null
                : request.review().trim());
    }

    private User getCustomer(String email) {
        User user = userService.getUserByEmail(email);
        if (user.getRole() != UserRole.CUSTOMER) {
            throw new UnauthorizedException("Only customers can create or update ratings");
        }
        return user;
    }

    private Job getJob(Long jobId) {
        return jobRepository.findDetailedById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));
    }

    private Rating getRating(Long ratingId) {
        return ratingRepository.findDetailedById(ratingId)
                .orElseThrow(() -> new ResourceNotFoundException("Rating not found with id: " + ratingId));
    }

    private WorkerProfile getWorker(Long workerId) {
        return workerRepository.findDetailedById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with id: " + workerId));
    }

    private void verifyViewAccess(User user, Rating rating) {
        boolean admin = user.getRole() == UserRole.ADMIN;
        boolean customer = user.getId().equals(rating.getCustomer().getId());
        boolean worker = user.getId().equals(rating.getWorker().getUser().getId());
        if (!admin && !customer && !worker) {
            throw new UnauthorizedException("You are not authorized to access this rating");
        }
    }
}
