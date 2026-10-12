import { apiClient } from './client';
import { BookingRequest, BookingResponse } from '../types';

export async function createBooking(data: BookingRequest): Promise<BookingResponse> {
  const response = await apiClient.post<BookingResponse>('/api/bookings', data);
  return response.data;
}

export async function getMyBookings(): Promise<BookingResponse[]> {
  const response = await apiClient.get<BookingResponse[]>('/api/bookings');
  return response.data;
}

export async function getBookingById(id: number): Promise<BookingResponse> {
  const response = await apiClient.get<BookingResponse>(`/api/bookings/${id}`);
  return response.data;
}

export async function cancelBooking(id: number): Promise<BookingResponse> {
  const response = await apiClient.patch<BookingResponse>(`/api/bookings/${id}/cancel`);
  return response.data;
}
