import { apiClient } from './client';
import { WorkerJobResponse, WorkerEarningsResponse, JobResponse } from '../types';

export async function getNewJobs(): Promise<WorkerJobResponse[]> {
  const response = await apiClient.get<WorkerJobResponse[]>('/api/workers/jobs/new');
  return response.data;
}

export async function getActiveJobs(): Promise<WorkerJobResponse[]> {
  const response = await apiClient.get<WorkerJobResponse[]>('/api/workers/jobs/active');
  return response.data;
}

export async function getCompletedJobs(): Promise<WorkerJobResponse[]> {
  const response = await apiClient.get<WorkerJobResponse[]>('/api/workers/jobs/completed');
  return response.data;
}

export async function getWorkerJobById(jobId: number): Promise<WorkerJobResponse> {
  const response = await apiClient.get<WorkerJobResponse>(`/api/workers/jobs/${jobId}`);
  return response.data;
}

export async function workerAcceptJob(jobId: number): Promise<JobResponse> {
  const response = await apiClient.patch<JobResponse>(`/api/workers/jobs/${jobId}/accept`);
  return response.data;
}

export async function workerStartJob(jobId: number): Promise<JobResponse> {
  const response = await apiClient.patch<JobResponse>(`/api/workers/jobs/${jobId}/start`);
  return response.data;
}

export async function workerCompleteJob(jobId: number): Promise<JobResponse> {
  const response = await apiClient.patch<JobResponse>(`/api/workers/jobs/${jobId}/complete`);
  return response.data;
}

export async function getWorkerEarnings(): Promise<WorkerEarningsResponse> {
  const response = await apiClient.get<WorkerEarningsResponse>('/api/workers/jobs/earnings');
  return response.data;
}
