package com.gigplatform.service;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceTypeRepository extends JpaRepository<ServiceType, Long> {

    Optional<ServiceType> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<ServiceType> findByActiveTrueOrderByNameAsc();
}
