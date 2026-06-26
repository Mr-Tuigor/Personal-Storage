export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DashboardStats {
  totalFiles: number;
  totalImages: number;
  totalAlbums: number;
  totalMusicAlbums: number;
  totalNotes: number;
  totalPasswords: number;
}
