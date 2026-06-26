import api from './client';
import type { User, ApiResponse } from '../types';

export const registerUser = (data: { username: string; email: string; password: string }) =>
  api.post<ApiResponse<User>>('/auth/register', data);

export const loginUser = (data: { email: string; password: string }) =>
  api.post<ApiResponse<User>>('/auth/login', data);

export const logoutUser = () =>
  api.post<ApiResponse>('/auth/logout');

export const getMe = () =>
  api.get<ApiResponse<User>>('/auth/me');
