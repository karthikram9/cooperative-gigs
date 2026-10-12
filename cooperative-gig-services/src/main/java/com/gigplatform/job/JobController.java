package com.gigplatform.job;

import com.gigplatform.job.dto.JobResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    public ResponseEntity<JobResponse> create(
            Authentication authentication,
            @Valid @RequestBody JobCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                jobService.create(authentication.getName(), request.bookingId(), request.workerId())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getById(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(jobService.getById(authentication.getName(), id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<JobResponse>> getMyJobs(Authentication authentication) {
        return ResponseEntity.ok(jobService.getMyJobs(authentication.getName()));
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<JobResponse> accept(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(jobService.accept(authentication.getName(), id));
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<JobResponse> start(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(jobService.start(authentication.getName(), id));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<JobResponse> complete(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(jobService.complete(authentication.getName(), id));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<JobResponse> cancel(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(jobService.cancel(authentication.getName(), id));
    }

    public record JobCreateRequest(
            @NotNull(message = "Booking is required")
            Long bookingId,

            @NotNull(message = "Worker is required")
            Long workerId
    ) {
    }
}
