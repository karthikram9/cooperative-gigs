package com.gigplatform.admin;

import com.gigplatform.admin.dto.CreateWorkerRequest;
import com.gigplatform.admin.dto.UpdateWorkerRequest;
import com.gigplatform.admin.dto.WorkerAdminResponse;
import com.gigplatform.admin.dto.WorkerStatusRequest;
import com.gigplatform.user.UserStatus;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/workers")
public class AdminWorkerController {

    private final AdminWorkerService adminWorkerService;

    public AdminWorkerController(AdminWorkerService adminWorkerService) {
        this.adminWorkerService = adminWorkerService;
    }

    @PostMapping
    public ResponseEntity<WorkerAdminResponse> create(@Valid @RequestBody CreateWorkerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminWorkerService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<WorkerAdminResponse>> getAll() {
        return ResponseEntity.ok(adminWorkerService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkerAdminResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(adminWorkerService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkerAdminResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateWorkerRequest request
    ) {
        return ResponseEntity.ok(adminWorkerService.update(id, request));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<WorkerAdminResponse> activate(@PathVariable Long id) {
        return ResponseEntity.ok(adminWorkerService.setStatus(id, UserStatus.ACTIVE));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<WorkerAdminResponse> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(adminWorkerService.setStatus(id, UserStatus.INACTIVE));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<WorkerAdminResponse> setStatus(
            @PathVariable Long id,
            @Valid @RequestBody WorkerStatusRequest request
    ) {
        return ResponseEntity.ok(adminWorkerService.setStatus(id, request.status()));
    }
}