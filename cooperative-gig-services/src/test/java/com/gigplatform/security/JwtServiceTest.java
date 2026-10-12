package com.gigplatform.security;

import com.gigplatform.user.User;
import com.gigplatform.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private final String validSecret = "super_secret_jwt_signing_key_at_least_32_chars";
    private final long expiration = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(validSecret, expiration);
    }

    @Test
    void testShortSecretThrowsException() {
        assertThrows(IllegalStateException.class, () -> new JwtService("short_secret", 3600000));
    }

    @Test
    void testGenerateAndValidateToken() {
        User user = new User("John Doe", "john@example.com", "9876543210", "hash", UserRole.CUSTOMER);
        String token = jwtService.generateToken(user);

        assertNotNull(token);
        assertFalse(token.isBlank());
        assertEquals("john@example.com", jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, "john@example.com"));
        assertFalse(jwtService.isTokenValid(token, "wrong@example.com"));
    }
}