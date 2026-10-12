import { apiClient } from './client';
import {
  AdminDashboardResponse,
  DemandResponse,
  AdminBookingResponse,
  WorkerAdminResponse,
  AdminWorkerDetailsResponse,
  WorkerLocationResponse,
} from '../types';

export async function getAdminDashboard(): Promise<AdminDashboardResponse> {
  const response = await apiClient.get<AdminDashboardResponse>('/api/admin/dashboard');
  return response.data;
}

export async function getAdminDemand(): Promise<DemandResponse[]> {
  const response = await apiClient.get<DemandResponse[]>('/api/admin/dashboard/demand');
  return response.data;
}

export async function getAdminBookings(): Promise<AdminBookingResponse[]> {
  const response = await apiClient.get<AdminBookingResponse[]>('/api/admin/bookings');
  return response.data;
}

export async function getAdminBookingById(bookingId: number): Promise<AdminBookingResponse> {
  const response = await apiClient.get<AdminBookingResponse>(`/api/admin/bookings/${bookingId}`);
  return response.data;
}

export async function getAdminWorkers(): Promise<WorkerAdminResponse[]> {
  const response = await apiClient.get<WorkerAdminResponse[]>('/api/admin/workers');
  return response.data;
}

export async function getAdminWorkerDetails(workerId: number): Promise<AdminWorkerDetailsResponse> {
  const response = await apiClient.get<AdminWorkerDetailsResponse>(`/api/admin/workers/${workerId}/details`);
  return response.data;
}

export async function createAdminWorker(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  location?: string;
  skills: string[];
}): Promise<WorkerAdminResponse> {
  const response = await apiClient.post<WorkerAdminResponse>('/api/admin/workers', data);
  return response.data;
}

export async function activateWorker(workerId: number): Promise<WorkerAdminResponse> {
  const response = await apiClient.patch<WorkerAdminResponse>(`/api/admin/workers/${workerId}/activate`);
  return response.data;
}

export async function deactivateWorker(workerId: number): Promise<WorkerAdminResponse> {
  const response = await apiClient.patch<WorkerAdminResponse>(`/api/admin/workers/${workerId}/deactivate`);
  return response.data;
}

export async function getWorkerLocations(): Promise<WorkerLocationResponse[]> {
  const response = await apiClient.get<WorkerLocationResponse[]>('/api/admin/workers/locations');
  return response.data;
}
