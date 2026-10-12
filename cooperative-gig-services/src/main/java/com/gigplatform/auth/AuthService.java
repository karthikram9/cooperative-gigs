package com.gigplatform.auth;

import com.gigplatform.auth.dto.AuthResponse;
import com.gigplatform.auth.dto.LoginRequest;
import com.gigplatform.auth.dto.RegisterRequest;
import com.gigplatform.exception.UnauthorizedException;
import com.gigplatform.security.JwtService;
import com.gigplatform.user.User;
import com.gigplatform.user.UserRole;
import com.gigplatform.user.UserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserService userService,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        User user = new User(
                request.name().trim(),
                request.email().trim().toLowerCase(),
                request.phone().trim(),
                passwordEncoder.encode(request.password()),
                UserRole.CUSTOMER
        );

        User savedUser = userService.createUser(user);
        return createResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.email().trim().toLowerCase(),
                            request.password()
                    )
            );
        } catch (AuthenticationException exception) {
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userService.getUserByEmail(authentication.getName());
        return createResponse(user);
    }

    private AuthResponse createResponse(User user) {
        String token = jwtService.generateToken(user);
        return new AuthResponse(
                token,
                "Bearer",
                new AuthResponse.UserInfo(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getPhone(),
                        user.getRole().name(),
                        user.getStatus().name()
                )
        );
    }
}
