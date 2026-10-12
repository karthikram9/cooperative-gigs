package com.gigplatform.worker;

import com.gigplatform.worker.dto.AvailabilityRequest;
import com.gigplatform.worker.dto.SkillRequest;
import com.gigplatform.worker.dto.WorkerProfileRequest;
import com.gigplatform.worker.dto.WorkerResponse;
import com.gigplatform.worker.dto.AvailableWorkerResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/workers")
public class WorkerController {

    private final WorkerService workerService;

    public WorkerController(WorkerService workerService) {
        this.workerService = workerService;
    }

        @GetMapping("/available")
        public ResponseEntity<List<AvailableWorkerResponse>> getAvailableWorkers(
                        @RequestParam String service
        ) {
                return ResponseEntity.ok(workerService.getAvailableWorkers(service));
        }

    @GetMapping("/{workerId}")
    public ResponseEntity<WorkerResponse> getProfile(@PathVariable Long workerId) {
        return ResponseEntity.ok(WorkerResponse.fromProfile(workerService.getProfile(workerId)));
    }

    @PostMapping
    public ResponseEntity<WorkerResponse> createProfile(
            Authentication authentication,
            @Valid @RequestBody WorkerProfileRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(WorkerResponse.fromProfile(
                workerService.createProfile(authentication.getName(), request)
        ));
    }

    @PutMapping("/{workerId}")
    public ResponseEntity<WorkerResponse> updateProfile(
            Authentication authentication,
            @PathVariable Long workerId,
            @Valid @RequestBody WorkerProfileRequest request
    ) {
        return ResponseEntity.ok(WorkerResponse.fromProfile(
                workerService.updateProfile(authentication.getName(), workerId, request)
        ));
    }

    @PostMapping("/{workerId}/skills")
    public ResponseEntity<WorkerResponse> addSkill(
            Authentication authentication,
            @PathVariable Long workerId,
            @Valid @RequestBody SkillRequest request
    ) {
        workerService.addSkill(authentication.getName(), workerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(WorkerResponse.fromProfile(
                workerService.getProfile(workerId)
        ));
    }

    @GetMapping("/{workerId}/skills")
    public ResponseEntity<List<WorkerResponse.SkillResponse>> getSkills(
            Authentication authentication,
            @PathVariable Long workerId
    ) {
        return ResponseEntity.ok(workerService.getSkills(authentication.getName(), workerId)
                .stream()
                .map(skill -> new WorkerResponse.SkillResponse(
                        skill.getId(), skill.getSkillName(), skill.getSkillLevel().name()
                ))
                .toList());
    }

    @DeleteMapping("/{workerId}/skills/{skillId}")
    public ResponseEntity<Void> removeSkill(
            Authentication authentication,
            @PathVariable Long workerId,
            @PathVariable Long skillId
    ) {
        workerService.removeSkill(authentication.getName(), workerId, skillId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{workerId}/availability")
    public ResponseEntity<WorkerResponse> updateAvailability(
            Authentication authentication,
            @PathVariable Long workerId,
            @Valid @RequestBody AvailabilityRequest request
    ) {
        return ResponseEntity.ok(WorkerResponse.fromProfile(
                workerService.updateAvailability(authentication.getName(), workerId, request)
        ));
    }

        @PatchMapping("/me/availability")
        public ResponseEntity<WorkerResponse> updateMyAvailability(
                        Authentication authentication,
                        @Valid @RequestBody AvailabilityRequest request
        ) {
                WorkerProfile profile = workerService.getProfileForUser(authentication.getName());
                return ResponseEntity.ok(WorkerResponse.fromProfile(
                                workerService.updateAvailability(authentication.getName(), profile.getId(), request)
                ));
        }
}
