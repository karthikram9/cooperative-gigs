package com.gigplatform.config;

import com.gigplatform.security.CustomUserDetailsService;
import com.gigplatform.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;

import java.io.IOException;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            DaoAuthenticationProvider authenticationProvider
    ) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .exceptionHandling(exceptions -> exceptions
                    .authenticationEntryPoint((request, response, exception) ->
                        writeSecurityError(response, 401, "Unauthorized")
                    )
                    .accessDeniedHandler((request, response, exception) ->
                        writeSecurityError(response, 403, "Forbidden")
                    )
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/health", "/api/auth/**", "/error").permitAll()
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.GET, "/api/workers/available").hasRole("CUSTOMER")
                    .requestMatchers("/api/workers/**").hasRole("WORKER")
                    .requestMatchers(HttpMethod.POST, "/api/services/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/services/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.PATCH, "/api/services/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.GET, "/api/users/*").authenticated()
                    .requestMatchers(HttpMethod.POST, "/api/users").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/api/users/*").authenticated()
                    .requestMatchers(HttpMethod.PATCH, "/api/users/**").hasRole("ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")
                    .requestMatchers("/api/bookings/**").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.POST, "/api/jobs").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/payments").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.PATCH, "/api/payments/*/refund").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private void writeSecurityError(
            jakarta.servlet.http.HttpServletResponse response,
            int status,
            String message
    ) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write(
                "{\"status\":" + status + ",\"error\":\"" + message + "\"}"
        );
    }
}
