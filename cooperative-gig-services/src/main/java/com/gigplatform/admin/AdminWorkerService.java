package com.gigplatform.admin;

import com.gigplatform.admin.dto.CreateWorkerRequest;
import com.gigplatform.admin.dto.UpdateWorkerRequest;
import com.gigplatform.admin.dto.WorkerAdminResponse;
import com.gigplatform.exception.ResourceNotFoundException;
import com.gigplatform.security.JwtService;
import com.gigplatform.user.User;
import com.gigplatform.user.UserRepository;
import com.gigplatform.user.UserRole;
import com.gigplatform.user.UserService;
import com.gigplatform.user.UserStatus;
import com.gigplatform.worker.SkillLevel;
import com.gigplatform.worker.WorkerProfile;
import com.gigplatform.worker.WorkerRepository;
import com.gigplatform.worker.WorkerSkill;
import com.gigplatform.worker.WorkerSkillRepository;
import com.gigplatform.worker.VerificationStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.HashSet;
import java.util.Set;

@Service
@Transactional
public class AdminWorkerService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final WorkerRepository workerRepository;
    private final WorkerSkillRepository workerSkillRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminWorkerService(
            UserRepository userRepository,
            UserService userService,
            WorkerRepository workerRepository,
            WorkerSkillRepository workerSkillRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.workerRepository = workerRepository;
        this.workerSkillRepository = workerSkillRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public WorkerAdminResponse create(CreateWorkerRequest request) {
        User user = new User(
                request.name().trim(),
                request.email().trim().toLowerCase(Locale.ROOT),
                request.phone().trim(),
                passwordEncoder.encode(request.password()),
                UserRole.WORKER
        );
        User savedUser = userService.createUser(user);

        WorkerProfile profile = new WorkerProfile();
        profile.setUser(savedUser);
        profile.setVerificationStatus(VerificationStatus.VERIFIED);
        profile.setLocation(trimToNull(request.location()));
        WorkerProfile savedProfile = workerRepository.save(profile);
        replaceSkills(savedProfile, request.skills());
        return WorkerAdminResponse.fromProfile(savedProfile);
    }

    @Transactional(readOnly = true)
    public List<WorkerAdminResponse> getAll() {
        return workerRepository.findAllByOrderByIdAsc().stream()
                .filter(profile -> profile.getUser().getRole() == UserRole.WORKER)
                .map(WorkerAdminResponse::fromProfile)
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkerAdminResponse getById(Long id) {
        return WorkerAdminResponse.fromProfile(getWorker(id));
    }

    public WorkerAdminResponse update(Long id, UpdateWorkerRequest request) {
        WorkerProfile profile = getWorker(id);
        User user = profile.getUser();

        if (request.name() != null) {
            user.setName(request.name().trim());
        }
        if (request.phone() != null && !request.phone().equals(user.getPhone())) {
            if (userRepository.existsByPhone(request.phone().trim())) {
                throw new com.gigplatform.exception.BadRequestException("Phone number is already registered");
            }
            user.setPhone(request.phone().trim());
        }
        if (request.password() != null) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        if (request.location() != null) {
            profile.setLocation(trimToNull(request.location()));
        }
        userRepository.save(user);
        replaceSkills(profile, request.skills());
        return WorkerAdminResponse.fromProfile(profile);
    }

    public WorkerAdminResponse setStatus(Long id, UserStatus status) {
        WorkerProfile profile = getWorker(id);
        profile.getUser().setStatus(status);
        userRepository.save(profile.getUser());
        return WorkerAdminResponse.fromProfile(profile);
    }

    private WorkerProfile getWorker(Long id) {
        WorkerProfile profile = workerRepository.findDetailedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found with id: " + id));
        if (profile.getUser().getRole() != UserRole.WORKER) {
            throw new ResourceNotFoundException("Worker profile not found with id: " + id);
        }
        return profile;
    }

    private void replaceSkills(WorkerProfile profile, List<String> skillNames) {
        if (skillNames == null) {
            return;
        }
        Set<String> normalizedSkills = new HashSet<>();
        for (String skillName : skillNames) {
            if (!normalizedSkills.add(normalizeSkill(skillName))) {
                throw new com.gigplatform.exception.BadRequestException("Duplicate worker skill: " + skillName);
            }
        }
        workerSkillRepository.deleteAll(profile.getSkills());
        profile.getSkills().clear();
        for (String skillName : normalizedSkills) {
            WorkerSkill skill = new WorkerSkill();
            skill.setWorkerProfile(profile);
            skill.setSkillName(skillName);
            skill.setSkillLevel(SkillLevel.BEGINNER);
            profile.getSkills().add(skill);
        }
        workerSkillRepository.saveAll(profile.getSkills());
    }

    private String normalizeSkill(String skillName) {
        String normalized = skillName.trim().toLowerCase(Locale.ROOT);
        return normalized.substring(0, 1).toUpperCase(Locale.ROOT) + normalized.substring(1);
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}