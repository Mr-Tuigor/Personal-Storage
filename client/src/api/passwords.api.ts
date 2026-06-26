import api from './client';
import type { PasswordEntry, PasswordDecrypted, ApiResponse, PaginatedResponse } from '../types';

export const getPasswords = (page = 1, limit = 20) =>
  api.get<PaginatedResponse<PasswordEntry>>(`/passwords?page=${page}&limit=${limit}`);

export const getPasswordById = (id: string) =>
  api.get<ApiResponse<PasswordDecrypted>>(`/passwords/${id}`);

export const createPassword = (data: {
  accountName: string;
  accountUsername: string;
  password: string;
  notes?: string;
}) => api.post<ApiResponse<PasswordEntry>>('/passwords', data);

export const updatePassword = (id: string, data: {
  accountName?: string;
  accountUsername?: string;
  password?: string;
  notes?: string;
}) => api.put<ApiResponse<PasswordEntry>>(`/passwords/${id}`, data);

export const deletePassword = (id: string) =>
  api.delete<ApiResponse>(`/passwords/${id}`);
