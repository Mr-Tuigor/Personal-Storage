// ─── API Response Types ──────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

// ─── User ────────────────────────────────────────────────────────

export interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
}

// ─── Password Vault ──────────────────────────────────────────────

export interface PasswordEntry {
  _id: string;
  accountName: string;
  accountUsername: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PasswordDecrypted extends PasswordEntry {
  password: string;
}

// ─── Documents ───────────────────────────────────────────────────

export interface DocumentFolder {
  _id: string;
  folderName: string;
  description?: string;
  fileCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  _id: string;
  userId: string;
  folderId?: string;
  originalName: string;
  r2Key: string;
  r2Url: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Images ──────────────────────────────────────────────────────

export interface ImageAlbum {
  _id: string;
  albumName: string;
  description?: string;
  imageCount: number;
  coverImage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ImageItem {
  _id: string;
  userId: string;
  albumId?: string;
  originalName: string;
  r2Key: string;
  r2Url: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Music ───────────────────────────────────────────────────────

export interface Track {
  _id: string;
  trackName: string;
  r2Key: string;
  r2Url: string;
  duration?: number;
}

export interface MusicAlbum {
  _id: string;
  albumName: string;
  artist: string;
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
}

// ─── Notes ───────────────────────────────────────────────────────

export interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Dashboard ───────────────────────────────────────────────────

export interface DashboardStats {
  totalFiles: number;
  totalImages: number;
  totalAlbums: number;
  totalMusicAlbums: number;
  totalNotes: number;
  totalPasswords: number;
}
