import { apiClient } from './client';
import { PaymentRequest, PaymentResponse } from '../types';

export async function createPayment(data: PaymentRequest): Promise<PaymentResponse> {
  const response = await apiClient.post<PaymentResponse>('/api/payments', data);
  return response.data;
}

export async function processPayment(paymentId: number): Promise<PaymentResponse> {
  const response = await apiClient.patch<PaymentResponse>(`/api/payments/${paymentId}/pay`);
  return response.data;
}

export async function getPaymentById(paymentId: number): Promise<PaymentResponse> {
  const response = await apiClient.get<PaymentResponse>(`/api/payments/${paymentId}`);
  return response.data;
}

export async function getPaymentByJobId(jobId: number): Promise<PaymentResponse> {
  const response = await apiClient.get<PaymentResponse>(`/api/payments/job/${jobId}`);
  return response.data;
}

export async function getMyPayments(): Promise<PaymentResponse[]> {
  const response = await apiClient.get<PaymentResponse[]>('/api/payments/my');
  return response.data;
}
