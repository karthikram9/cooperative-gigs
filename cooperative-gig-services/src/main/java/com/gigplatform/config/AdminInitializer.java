package com.gigplatform.config;

import com.gigplatform.user.User;
import com.gigplatform.user.UserRepository;
import com.gigplatform.user.UserRole;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Bean
    CommandLineRunner seedAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.email}") String email,
            @Value("${app.admin.password}") String password,
            @Value("${app.admin.name}") String name,
            @Value("${app.admin.phone}") String phone
    ) {
        return args -> {
            if (userRepository.existsByRole(UserRole.ADMIN)) {
                return;
            }
            if (email.isBlank() || password.isBlank()) {
                throw new IllegalStateException(
                        "ADMIN_EMAIL and ADMIN_PASSWORD must be configured before creating the initial admin"
                );
            }

            User admin = new User(
                    name,
                    email,
                    phone,
                    passwordEncoder.encode(password),
                    UserRole.ADMIN
            );
            userRepository.save(admin);
        };
    }
}