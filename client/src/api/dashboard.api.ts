import api from './client';
import type { DashboardStats, ApiResponse } from '../types';

export const getDashboardStats = () =>
  api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
