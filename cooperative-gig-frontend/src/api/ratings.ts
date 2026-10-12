import { apiClient } from './client';
import { RatingRequest, RatingResponse, RatingSummaryResponse } from '../types';

export async function submitRating(data: RatingRequest): Promise<RatingResponse> {
  const response = await apiClient.post<RatingResponse>('/api/ratings', data);
  return response.data;
}

export async function getWorkerRatings(workerId: number): Promise<RatingResponse[]> {
  const response = await apiClient.get<RatingResponse[]>(`/api/ratings/worker/${workerId}`);
  return response.data;
}

export async function getWorkerRatingSummary(workerId: number): Promise<RatingSummaryResponse> {
  const response = await apiClient.get<RatingSummaryResponse>(`/api/ratings/worker/${workerId}/summary`);
  return response.data;
}
