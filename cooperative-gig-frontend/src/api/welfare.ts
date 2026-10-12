import { apiClient } from './client';
import { WelfareResponse, WelfareSummaryResponse } from '../types';

export async function recordWelfareDeduction(paymentId: number): Promise<WelfareResponse> {
  const response = await apiClient.post<WelfareResponse>(`/api/welfare/payment/${paymentId}`);
  return response.data;
}

export async function getWelfareById(id: number): Promise<WelfareResponse> {
  const response = await apiClient.get<WelfareResponse>(`/api/welfare/${id}`);
  return response.data;
}

export async function getMyWelfare(): Promise<WelfareResponse[]> {
  const response = await apiClient.get<WelfareResponse[]>('/api/welfare/my');
  return response.data;
}

export async function getMyWelfareSummary(): Promise<WelfareSummaryResponse> {
  const response = await apiClient.get<WelfareSummaryResponse>('/api/welfare/my/summary');
  return response.data;
}
