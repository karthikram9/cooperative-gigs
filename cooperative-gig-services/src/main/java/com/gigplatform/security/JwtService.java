package com.gigplatform.security;

import com.gigplatform.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expiration;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration}") long expiration
    ) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException("app.jwt.secret must be configured with at least 32 characters");
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
    }

    public String generateToken(User user) {
        Date issuedAt = new Date();
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(issuedAt)
                .expiration(new Date(issuedAt.getTime() + expiration))
                .signWith(signingKey)
                .compact();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, String username) {
        try {
            Claims claims = parseClaims(token);
            return username.equals(claims.getSubject())
                    && claims.getExpiration() != null
                    && claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException exception) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
