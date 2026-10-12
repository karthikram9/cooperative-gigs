import { apiClient } from './client';
import { ServiceType } from '../types';

export async function getServices(): Promise<ServiceType[]> {
  const response = await apiClient.get<ServiceType[]>('/api/services');
  return response.data;
}

export async function getServiceById(id: number): Promise<ServiceType> {
  const response = await apiClient.get<ServiceType>(`/api/services/${id}`);
  return response.data;
}
