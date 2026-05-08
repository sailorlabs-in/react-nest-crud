import { apiClient } from './apiClient';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types';

export async function login(payload: LoginPayload) {
  const response = await apiClient.post<AuthResponse>('/auth/login', payload);
  return response.data;
}

export async function register(payload: RegisterPayload) {
  const response = await apiClient.post<AuthResponse>('/auth/register', payload);
  return response.data;
}

export async function getProfile() {
  const response = await apiClient.get<User>('/auth/profile');
  return response.data;
}
