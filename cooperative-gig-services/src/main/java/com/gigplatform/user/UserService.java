package com.gigplatform.user;

import com.gigplatform.exception.BadRequestException;
import com.gigplatform.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /*
     * Create user
     *
     * This method expects passwordHash rather than a raw password.
     * The AuthService will handle password encoding during registration.
     */
    public synchronized User createUser(User user) {

        if (user.getName() != null) {
            user.setName(user.getName().trim());
        }
        if (user.getEmail() != null) {
            user.setEmail(user.getEmail().trim().toLowerCase());
        }
        if (user.getPhone() != null) {
            user.setPhone(user.getPhone().trim());
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        if (userRepository.existsByPhone(user.getPhone())) {
            throw new BadRequestException("Phone number is already registered");
        }

        if (user.getRole() == null) {
            user.setRole(UserRole.CUSTOMER);
        }

        if (user.getRole() == UserRole.ADMIN && userRepository.existsByRole(UserRole.ADMIN)) {
            throw new BadRequestException("Only one admin account is allowed");
        }

        if (user.getStatus() == null) {
            user.setStatus(UserStatus.ACTIVE);
        }

        return userRepository.save(user);
    }

    /*
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + id
                        )
                );
    }

    /*
     * Get user by email
     *
     * Mainly useful for AuthService/Security layer.
     */
    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with email: " + email
                        )
                );
    }

    /*
     * Get all users
     */
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /*
     * Update basic user information
     */
    public User updateUser(
            Long id,
            String name,
            String phone
    ) {

        User user = getUserById(id);

        if (phone != null && !phone.equals(user.getPhone())) {

            if (userRepository.existsByPhone(phone)) {
                throw new BadRequestException(
                        "Phone number is already registered"
                );
            }

            user.setPhone(phone);
        }

        if (name != null && !name.isBlank()) {
            user.setName(name);
        }

        return userRepository.save(user);
    }

    /*
     * Activate user
     */
    public User activateUser(Long id) {

        User user = getUserById(id);

        user.setStatus(UserStatus.ACTIVE);

        return userRepository.save(user);
    }

    /*
     * Deactivate user
     */
    public User deactivateUser(Long id) {

        User user = getUserById(id);

        user.setStatus(UserStatus.INACTIVE);

        return userRepository.save(user);
    }

    /*
     * Suspend user
     */
    public User suspendUser(Long id) {

        User user = getUserById(id);

        user.setStatus(UserStatus.SUSPENDED);

        return userRepository.save(user);
    }

    /*
     * Delete user
     *
     * This is kept here for administration purposes.
     * Other modules should not directly delete users.
     */
    public void deleteUser(Long id) {

        User user = getUserById(id);

        userRepository.delete(user);
    }
}