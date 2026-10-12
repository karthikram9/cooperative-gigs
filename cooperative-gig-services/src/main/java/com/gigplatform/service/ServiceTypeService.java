package com.gigplatform.service;

import com.gigplatform.exception.BadRequestException;
import com.gigplatform.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.math.BigDecimal;

@Service
@Transactional
public class ServiceTypeService {

    private final ServiceTypeRepository serviceTypeRepository;

    public ServiceTypeService(ServiceTypeRepository serviceTypeRepository) {
        this.serviceTypeRepository = serviceTypeRepository;
    }

    public ServiceType create(String name, String description, BigDecimal basePrice) {
        String normalizedName = normalizeName(name);
        ensureNameAvailable(normalizedName, null);

        ServiceType serviceType = new ServiceType();
        serviceType.setName(normalizedName);
        serviceType.setDescription(normalizeDescription(description));
        serviceType.setBasePrice(normalizePrice(basePrice));
        serviceType.setActive(true);
        return serviceTypeRepository.save(serviceType);
    }

    @Transactional(readOnly = true)
    public List<ServiceType> getActiveServices() {
        return serviceTypeRepository.findByActiveTrueOrderByNameAsc();
    }

    @Transactional(readOnly = true)
    public ServiceType getById(Long id) {
        return serviceTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
    }

    public ServiceType update(Long id, String name, String description, BigDecimal basePrice) {
        ServiceType serviceType = getById(id);
        String normalizedName = normalizeName(name);
        ensureNameAvailable(normalizedName, id);
        serviceType.setName(normalizedName);
        serviceType.setDescription(normalizeDescription(description));
        serviceType.setBasePrice(normalizePrice(basePrice));
        return serviceTypeRepository.save(serviceType);
    }

    public ServiceType activate(Long id) {
        ServiceType serviceType = getById(id);
        serviceType.setActive(true);
        return serviceTypeRepository.save(serviceType);
    }

    public ServiceType deactivate(Long id) {
        ServiceType serviceType = getById(id);
        serviceType.setActive(false);
        return serviceTypeRepository.save(serviceType);
    }

    private void ensureNameAvailable(String name, Long currentId) {
        serviceTypeRepository.findByNameIgnoreCase(name).ifPresent(existing -> {
            if (currentId == null || !existing.getId().equals(currentId)) {
                throw new BadRequestException("Service name is already registered");
            }
        });
    }

    private String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Service name is required");
        }
        String normalized = name.trim().toLowerCase();
        return Character.toUpperCase(normalized.charAt(0)) + normalized.substring(1);
    }

    private String normalizeDescription(String description) {
        return description == null || description.isBlank() ? null : description.trim();
    }

    private BigDecimal normalizePrice(BigDecimal basePrice) {
        return basePrice == null ? BigDecimal.valueOf(500) : basePrice;
    }
}
