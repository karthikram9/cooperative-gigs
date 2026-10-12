package com.gigplatform.worker;

import com.gigplatform.job.JobService;
import com.gigplatform.job.dto.JobResponse;
import com.gigplatform.worker.dto.WorkerEarningsResponse;
import com.gigplatform.worker.dto.WorkerJobResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/workers/jobs")
public class WorkerJobController {

    private final JobService jobService;

    public WorkerJobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping("/new")
    public ResponseEntity<List<WorkerJobResponse>> getNew(Authentication authentication) {
        return ResponseEntity.ok(jobService.getNewWorkerJobs(authentication.getName()));
    }

    @GetMapping("/active")
    public ResponseEntity<List<WorkerJobResponse>> getActive(Authentication authentication) {
        return ResponseEntity.ok(jobService.getActiveWorkerJobs(authentication.getName()));
    }

    @GetMapping("/completed")
    public ResponseEntity<List<WorkerJobResponse>> getCompleted(Authentication authentication) {
        return ResponseEntity.ok(jobService.getCompletedWorkerJobs(authentication.getName()));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<WorkerJobResponse> getById(Authentication authentication, @PathVariable Long jobId) {
        return ResponseEntity.ok(jobService.getWorkerJob(authentication.getName(), jobId));
    }

    @PatchMapping("/{jobId}/accept")
    public ResponseEntity<JobResponse> accept(Authentication authentication, @PathVariable Long jobId) {
        return ResponseEntity.ok(jobService.accept(authentication.getName(), jobId));
    }

    @PatchMapping("/{jobId}/start")
    public ResponseEntity<JobResponse> start(Authentication authentication, @PathVariable Long jobId) {
        return ResponseEntity.ok(jobService.start(authentication.getName(), jobId));
    }

    @PatchMapping("/{jobId}/complete")
    public ResponseEntity<JobResponse> complete(Authentication authentication, @PathVariable Long jobId) {
        return ResponseEntity.ok(jobService.complete(authentication.getName(), jobId));
    }

    @GetMapping("/earnings")
    public ResponseEntity<WorkerEarningsResponse> earnings(Authentication authentication) {
        return ResponseEntity.ok(jobService.getWorkerEarnings(authentication.getName()));
    }
}