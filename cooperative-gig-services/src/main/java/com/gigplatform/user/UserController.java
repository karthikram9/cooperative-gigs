package com.gigplatform.user;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /*
     * Get all users
     *
     * GET /api/users
     */
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        List<UserResponse> users = userService.getAllUsers()
                .stream()
                .map(UserResponse::fromUser)
                .toList();

        return ResponseEntity.ok(users);
    }

    /*
     * Get user by ID
     *
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(
                        @PathVariable Long id,
                        Authentication authentication
    ) {

        User user = userService.getUserById(id);
                assertSelfOrAdmin(user, authentication);

        return ResponseEntity.ok(UserResponse.fromUser(user));
    }

    /*
     * Create user
     *
     * NOTE:
     * Normal registration should eventually go through AuthController.
     * This endpoint is useful for internal/admin operations.
     *
     * POST /api/users
     */
    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request
    ) {

        User user = new User();

        user.setName(request.name());
        user.setEmail(request.email());
        user.setPhone(request.phone());

        /*
         * This endpoint should only receive an already encoded password.
         * Authentication/registration will normally use AuthService.
         */
        user.setPasswordHash(request.passwordHash());

        user.setRole(
                request.role() != null
                        ? request.role()
                        : UserRole.CUSTOMER
        );

        User savedUser = userService.createUser(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(UserResponse.fromUser(savedUser));
    }

    /*
     * Update user
     *
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
                        @Valid @RequestBody UpdateUserRequest request,
                        Authentication authentication
    ) {

                assertSelfOrAdmin(userService.getUserById(id), authentication);
        User updatedUser = userService.updateUser(
                id,
                request.name(),
                request.phone()
        );

        return ResponseEntity.ok(
                UserResponse.fromUser(updatedUser)
        );
    }

    /*
     * Activate user
     *
     * PATCH /api/users/{id}/activate
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<UserResponse> activateUser(
            @PathVariable Long id
    ) {

        User user = userService.activateUser(id);

        return ResponseEntity.ok(
                UserResponse.fromUser(user)
        );
    }

    /*
     * Deactivate user
     *
     * PATCH /api/users/{id}/deactivate
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<UserResponse> deactivateUser(
            @PathVariable Long id
    ) {

        User user = userService.deactivateUser(id);

        return ResponseEntity.ok(
                UserResponse.fromUser(user)
        );
    }

    /*
     * Suspend user
     *
     * PATCH /api/users/{id}/suspend
     */
    @PatchMapping("/{id}/suspend")
    public ResponseEntity<UserResponse> suspendUser(
            @PathVariable Long id
    ) {

        User user = userService.suspendUser(id);

        return ResponseEntity.ok(
                UserResponse.fromUser(user)
        );
    }

    /*
     * Delete user
     *
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id
    ) {

        userService.deleteUser(id);

        return ResponseEntity.noContent().build();
    }

        private void assertSelfOrAdmin(User user, Authentication authentication) {
                boolean isAdmin = authentication.getAuthorities().stream()
                                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

                if (!isAdmin && !user.getEmail().equalsIgnoreCase(authentication.getName())) {
                        throw new AccessDeniedException("You can only access your own profile");
                }
        }

    /*
     * Request DTO for creating users.
     */
    public record CreateUserRequest(

            @NotBlank(message = "Name is required")
            @Size(min = 2, max = 100)
            String name,

            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email,

            @NotBlank(message = "Phone is required")
            @Pattern(
                    regexp = "^[6-9][0-9]{9}$",
                    message = "Invalid phone number"
            )
            String phone,

            @NotBlank(message = "Password hash is required")
            String passwordHash,

            UserRole role
    ) {
    }

    /*
     * Request DTO for updating users.
     */
    public record UpdateUserRequest(

            @Size(min = 2, max = 100)
            String name,

            @Pattern(
                    regexp = "^[6-9][0-9]{9}$",
                    message = "Invalid phone number"
            )
            String phone
    ) {
    }

    /*
     * Response DTO.
     *
     * IMPORTANT:
     * passwordHash is intentionally NOT returned.
     */
    public record UserResponse(
            Long id,
            String name,
            String email,
            String phone,
            UserRole role,
            UserStatus status
    ) {

        public static UserResponse fromUser(User user) {

            return new UserResponse(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getPhone(),
                    user.getRole(),
                    user.getStatus()
            );
        }
    }
}