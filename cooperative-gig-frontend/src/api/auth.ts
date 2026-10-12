import { apiClient } from './client';
import { AuthResponse } from '../types';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/auth/login', { email, password });
  return response.data;
}

export async function register(name: string, email: string, phone: string, password: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/auth/register', { name, email, phone, password });
  return response.data;
}
