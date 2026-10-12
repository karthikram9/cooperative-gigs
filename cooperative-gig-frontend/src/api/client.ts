import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string; status?: number }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string; details?: string[] } | undefined;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (error.response?.status === 403) return 'Access forbidden. You do not have permission for this action.';
    if (error.response?.status === 404) return 'The requested resource was not found.';
    if (error.response?.status === 500) return 'Internal server error. Please try again later.';
    return error.message || 'A network error occurred. Please check connection.';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}
