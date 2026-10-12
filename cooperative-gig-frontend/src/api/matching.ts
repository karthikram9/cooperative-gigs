import { apiClient } from './client';
import { MatchResult } from '../types';

export async function findMatches(bookingId: number): Promise<MatchResult[]> {
  const response = await apiClient.get<MatchResult[]>(`/api/matching/bookings/${bookingId}`);
  return response.data;
}

export async function findBestMatch(bookingId: number): Promise<MatchResult> {
  const response = await apiClient.get<MatchResult>(`/api/matching/bookings/${bookingId}/best`);
  return response.data;
}
