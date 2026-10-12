package com.gigplatform.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_user_phone", columnNames = "phone")
        }
)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 150, message = "Email cannot exceed 150 characters")
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^[6-9][0-9]{9}$",
            message = "Phone number must be a valid 10-digit Indian mobile number"
    )
    @Column(nullable = false, unique = true, length = 10)
    private String phone;

    /*
     * Stores the encoded password.
     *
     * Raw passwords must NEVER be stored in the database.
     * Password encoding will be handled by the authentication module.
     */
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public User() {
    }

    public User(
            String name,
            String email,
            String phone,
            String passwordHash,
            UserRole role
    ) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.passwordHash = passwordHash;
        this.role = role;
        this.status = UserStatus.ACTIVE;
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (status == null) {
            status = UserStatus.ACTIVE;
        }

        if (role == null) {
            role = UserRole.CUSTOMER;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}