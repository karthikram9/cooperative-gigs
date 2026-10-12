package com.gigplatform.config;

import com.gigplatform.service.ServiceType;
import com.gigplatform.service.ServiceTypeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.Map;

@Configuration
public class ServiceInitializer {

    @Bean
    CommandLineRunner seedServices(ServiceTypeRepository repository) {
        return args -> Map.of(
                "Plumbing", BigDecimal.valueOf(500),
                "Electrical", BigDecimal.valueOf(600),
                "Cleaning", BigDecimal.valueOf(400),
                "Carpentry", BigDecimal.valueOf(700)
        ).forEach((name, price) -> repository.findByNameIgnoreCase(name).orElseGet(() -> {
            ServiceType service = new ServiceType();
            service.setName(name);
            service.setDescription(name + " services");
            service.setBasePrice(price);
            service.setActive(true);
            return repository.save(service);
        }));
    }
}