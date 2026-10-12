package com.gigplatform.worker;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkerSkillRepository extends JpaRepository<WorkerSkill, Long> {

	List<WorkerSkill> findByWorkerProfileId(Long workerProfileId);

	boolean existsByWorkerProfileIdAndSkillNameIgnoreCase(Long workerProfileId, String skillName);

	Optional<WorkerSkill> findByIdAndWorkerProfileId(Long id, Long workerProfileId);
}
