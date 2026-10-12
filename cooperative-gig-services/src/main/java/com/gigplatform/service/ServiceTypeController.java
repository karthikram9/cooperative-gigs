package com.gigplatform.service;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/services")
public class ServiceTypeController {

    private final ServiceTypeService serviceTypeService;

    public ServiceTypeController(ServiceTypeService serviceTypeService) {
        this.serviceTypeService = serviceTypeService;
    }

    @GetMapping
    public ResponseEntity<List<ServiceTypeResponse>> getActiveServices() {
        return ResponseEntity.ok(serviceTypeService.getActiveServices().stream()
                .map(ServiceTypeResponse::fromEntity)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceTypeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ServiceTypeResponse.fromEntity(serviceTypeService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ServiceTypeResponse> create(
            @Valid @RequestBody ServiceTypeRequest request
    ) {
        ServiceType serviceType = serviceTypeService.create(request.name(), request.description(), request.basePrice());
        return ResponseEntity.status(HttpStatus.CREATED).body(ServiceTypeResponse.fromEntity(serviceType));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceTypeResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ServiceTypeRequest request
    ) {
        return ResponseEntity.ok(ServiceTypeResponse.fromEntity(
                serviceTypeService.update(id, request.name(), request.description(), request.basePrice())
        ));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<ServiceTypeResponse> activate(@PathVariable Long id) {
        return ResponseEntity.ok(ServiceTypeResponse.fromEntity(serviceTypeService.activate(id)));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ServiceTypeResponse> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(ServiceTypeResponse.fromEntity(serviceTypeService.deactivate(id)));
    }

    public record ServiceTypeRequest(
            @NotBlank(message = "Service name is required")
            @Size(max = 100, message = "Service name cannot exceed 100 characters")
            String name,

            @Size(max = 500, message = "Description cannot exceed 500 characters")
            String description,

            @jakarta.validation.constraints.DecimalMin(value = "0.0", message = "Base price cannot be negative")
            BigDecimal basePrice
    ) {
    }

    public record ServiceTypeResponse(
            Long id,
            String name,
            String description,
            BigDecimal basePrice,
            boolean active
    ) {
        private static ServiceTypeResponse fromEntity(ServiceType serviceType) {
            return new ServiceTypeResponse(
                    serviceType.getId(),
                    serviceType.getName(),
                    serviceType.getDescription(),
                    serviceType.getBasePrice(),
                    serviceType.isActive()
            );
        }
    }
}
