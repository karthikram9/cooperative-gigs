package com.gigplatform.worker;

import com.gigplatform.exception.BadRequestException;
import com.gigplatform.exception.ResourceNotFoundException;
import com.gigplatform.exception.UnauthorizedException;
import com.gigplatform.user.User;
import com.gigplatform.user.UserRole;
import com.gigplatform.user.UserService;
import com.gigplatform.worker.dto.AvailabilityRequest;
import com.gigplatform.worker.dto.SkillRequest;
import com.gigplatform.worker.dto.WorkerProfileRequest;
import com.gigplatform.worker.dto.AvailableWorkerResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class WorkerService {

    private final WorkerRepository workerRepository;
    private final WorkerSkillRepository workerSkillRepository;
    private final UserService userService;

    public WorkerService(
            WorkerRepository workerRepository,
            WorkerSkillRepository workerSkillRepository,
            UserService userService
    ) {
        this.workerRepository = workerRepository;
        this.workerSkillRepository = workerSkillRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public WorkerProfile getProfile(Long workerId) {
        return workerRepository.findDetailedById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found with id: " + workerId));
    }

    @Transactional(readOnly = true)
    public WorkerProfile getProfileForUser(String email) {
        User user = userService.getUserByEmail(email);
        if (user.getRole() != UserRole.WORKER) {
            throw new UnauthorizedException("Only workers can access worker availability");
        }
        return workerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));
    }

        @Transactional(readOnly = true)
        public List<AvailableWorkerResponse> getAvailableWorkers(String serviceName) {
        String requested = normalizeSkillName(serviceName);
        return workerRepository.findAvailableWorkers(
                UserRole.WORKER,
                AvailabilityStatus.AVAILABLE,
                VerificationStatus.VERIFIED
            ).stream()
            .filter(profile -> profile.getSkills().stream()
                .anyMatch(skill -> skill.getSkillName().equalsIgnoreCase(requested)))
            .map(AvailableWorkerResponse::fromProfile)
            .toList();
        }

    public WorkerProfile createProfile(String email, WorkerProfileRequest request) {
        User user = getWorkerUser(email);
        if (workerRepository.existsByUserId(user.getId())) {
            throw new BadRequestException("Worker profile already exists");
        }

        WorkerProfile profile = new WorkerProfile();
        profile.setUser(user);
        profile.setVerificationStatus(VerificationStatus.PENDING);
        profile.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
        applyProfileFields(profile, request);
        return workerRepository.save(profile);
    }

    public WorkerProfile updateProfile(String email, Long workerId, WorkerProfileRequest request) {
        WorkerProfile profile = getOwnedProfile(email, workerId);
        applyProfileFields(profile, request);
        return workerRepository.save(profile);
    }

    @Transactional(readOnly = true)
    public List<WorkerSkill> getSkills(String email, Long workerId) {
        WorkerProfile profile = getOwnedProfile(email, workerId);
        return workerSkillRepository.findByWorkerProfileId(profile.getId());
    }

    public WorkerSkill addSkill(String email, Long workerId, SkillRequest request) {
        WorkerProfile profile = getOwnedProfile(email, workerId);
        String skillName = normalizeSkillName(request.skillName());

        if (workerSkillRepository.existsByWorkerProfileIdAndSkillNameIgnoreCase(profile.getId(), skillName)) {
            throw new BadRequestException("Skill is already added to this profile");
        }

        WorkerSkill skill = new WorkerSkill();
        skill.setWorkerProfile(profile);
        skill.setSkillName(skillName);
        skill.setSkillLevel(request.skillLevel());
        return workerSkillRepository.save(skill);
    }

    public void removeSkill(String email, Long workerId, Long skillId) {
        WorkerProfile profile = getOwnedProfile(email, workerId);
        WorkerSkill skill = workerSkillRepository.findByIdAndWorkerProfileId(skillId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + skillId));
        workerSkillRepository.delete(skill);
    }

    public WorkerProfile updateAvailability(String email, Long workerId, AvailabilityRequest request) {
        WorkerProfile profile = getOwnedProfile(email, workerId);
        profile.setAvailabilityStatus(request.availabilityStatus());
        return workerRepository.save(profile);
    }

    private void applyProfileFields(WorkerProfile profile, WorkerProfileRequest request) {
        if (request.bio() != null) {
            profile.setBio(request.bio().trim());
        }
        if (request.location() != null) {
            profile.setLocation(request.location().trim());
        }
        if (request.address() != null) {
            profile.setAddress(request.address().trim());
        }
        if (request.experienceYears() != null) {
            profile.setExperienceYears(request.experienceYears());
        }
        if (request.hourlyRate() != null) {
            profile.setHourlyRate(request.hourlyRate());
        }
    }

    private WorkerProfile getOwnedProfile(String email, Long workerId) {
        User user = userService.getUserByEmail(email);
        if (user.getRole() != UserRole.WORKER) {
            throw new BadRequestException("Only workers can manage a worker profile");
        }
        WorkerProfile profile = getProfile(workerId);
        if (!profile.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to manage this worker profile");
        }
        return profile;
    }

    private User getWorkerUser(String email) {
        User user = userService.getUserByEmail(email);
        if (user.getRole() != UserRole.WORKER) {
            throw new BadRequestException("Only workers can create a worker profile");
        }
        return user;
    }

    private String normalizeSkillName(String skillName) {
        String normalized = skillName.trim().toLowerCase(Locale.ROOT);
        return normalized.substring(0, 1).toUpperCase(Locale.ROOT) + normalized.substring(1);
    }
}
