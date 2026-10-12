import { apiClient } from './client';
import { JobResponse } from '../types';

export async function createJob(bookingId: number, workerId: number): Promise<JobResponse> {
  const response = await apiClient.post<JobResponse>('/api/jobs', { bookingId, workerId });
  return response.data;
}

export async function getJobById(id: number): Promise<JobResponse> {
  const response = await apiClient.get<JobResponse>(`/api/jobs/${id}`);
  return response.data;
}

export async function getMyJobs(): Promise<JobResponse[]> {
  const response = await apiClient.get<JobResponse[]>('/api/jobs/my');
  return response.data;
}

export async function acceptJob(id: number): Promise<JobResponse> {
  const response = await apiClient.patch<JobResponse>(`/api/jobs/${id}/accept`);
  return response.data;
}

export async function startJob(id: number): Promise<JobResponse> {
  const response = await apiClient.patch<JobResponse>(`/api/jobs/${id}/start`);
  return response.data;
}

export async function completeJob(id: number): Promise<JobResponse> {
  const response = await apiClient.patch<JobResponse>(`/api/jobs/${id}/complete`);
  return response.data;
}

export async function cancelJob(id: number): Promise<JobResponse> {
  const response = await apiClient.patch<JobResponse>(`/api/jobs/${id}/cancel`);
  return response.data;
}
