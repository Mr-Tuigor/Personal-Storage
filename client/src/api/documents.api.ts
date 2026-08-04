import api from './client';
import axios from 'axios';
import type { Document, DocumentFolder, ApiResponse, PaginatedResponse } from '../types';

export const getDocumentFolders = () =>
  api.get<ApiResponse<DocumentFolder[]>>('/documents/folders');

export const createDocumentFolder = (data: { folderName: string; description?: string }) =>
  api.post<ApiResponse<DocumentFolder>>('/documents/folders', data);

export const deleteDocumentFolder = (id: string) =>
  api.delete<ApiResponse>(`/documents/folders/${id}`);

export const getDocuments = (page = 1, limit = 20, folderId?: string) => {
  let url = `/documents?page=${page}&limit=${limit}`;
  if (folderId) url += `&folderId=${folderId}`;
  return api.get<PaginatedResponse<Document>>(url);
};

export const uploadDocument = async (file: File, folderId?: string) => {
  // 1. Get presigned PUT URL from backend
  const res = await api.post<ApiResponse<{ document: Document; presignedUrl: string }>>('/documents/upload', {
    filename: file.name,
    contentType: file.type || 'application/octet-stream',
    fileSize: file.size,
    folderId,
  });

  const { presignedUrl } = res.data.data!;

  // 2. Upload file directly to R2 using PUT
  await axios.put(presignedUrl, file, {
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
  });

  // Return formatted response for compatibility with UI
  return { data: res.data };
};

export const downloadDocument = (id: string) =>
  api.get<ApiResponse<{ url: string; originalName: string }>>(`/documents/${id}/download`);

export const deleteDocument = (id: string) =>
  api.delete<ApiResponse>(`/documents/${id}`);

export const moveDocument = (id: string, newFolderId: string | null) =>
  api.put<ApiResponse>(`/documents/${id}/move`, { newFolderId });
