import { apiClient } from './client';
import { WorkerProfile, WorkerSkill } from '../types';

export async function getWorkerProfile(workerId: number): Promise<WorkerProfile> {
  const response = await apiClient.get<WorkerProfile>(`/api/workers/${workerId}`);
  return response.data;
}

export async function updateWorkerProfile(
  workerId: number,
  data: { bio?: string; location?: string; address?: string; hourlyRate?: number; experienceYears?: number }
): Promise<WorkerProfile> {
  const response = await apiClient.put<WorkerProfile>(`/api/workers/${workerId}`, data);
  return response.data;
}

export async function updateAvailability(workerId: number, status: 'AVAILABLE' | 'UNAVAILABLE'): Promise<WorkerProfile> {
  const response = await apiClient.patch<WorkerProfile>(`/api/workers/${workerId}/availability`, {
    availabilityStatus: status,
  });
  return response.data;
}

export async function updateMyAvailability(status: 'AVAILABLE' | 'UNAVAILABLE'): Promise<WorkerProfile> {
  const response = await apiClient.patch<WorkerProfile>('/api/workers/me/availability', {
    availabilityStatus: status,
  });
  return response.data;
}

export async function getWorkerSkills(workerId: number): Promise<WorkerSkill[]> {
  const response = await apiClient.get<WorkerSkill[]>(`/api/workers/${workerId}/skills`);
  return response.data;
}

export async function addWorkerSkill(workerId: number, skillName: string, skillLevel: string): Promise<WorkerProfile> {
  const response = await apiClient.post<WorkerProfile>(`/api/workers/${workerId}/skills`, {
    skillName,
    skillLevel,
  });
  return response.data;
}

export async function removeWorkerSkill(workerId: number, skillId: number): Promise<void> {
  await apiClient.delete(`/api/workers/${workerId}/skills/${skillId}`);
}
