import api from './client';
import axios from 'axios';
import type { ImageItem, ImageAlbum, ApiResponse, PaginatedResponse } from '../types';

export const getImageAlbums = () =>
  api.get<ApiResponse<ImageAlbum[]>>('/images/albums');

export const createImageAlbum = (data: { albumName: string; description?: string }) =>
  api.post<ApiResponse<ImageAlbum>>('/images/albums', data);

export const deleteImageAlbum = (id: string) =>
  api.delete<ApiResponse>(`/images/albums/${id}`);

export const getImages = (page = 1, limit = 20, albumId?: string) => {
  let url = `/images?page=${page}&limit=${limit}`;
  if (albumId) url += `&albumId=${albumId}`;
  return api.get<PaginatedResponse<ImageItem>>(url);
};

export const uploadImage = async (file: File, albumId?: string) => {
  // 1. Get presigned PUT URL from backend
  const res = await api.post<ApiResponse<{ image: ImageItem; presignedUrl: string }>>('/images/upload', {
    filename: file.name,
    contentType: file.type || 'application/octet-stream',
    fileSize: file.size,
    albumId,
  });

  const { image, presignedUrl } = res.data.data!;

  // 2. Upload file directly to R2 using PUT
  await axios.put(presignedUrl, file, {
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
  });

  // Return formatted response for compatibility with UI
  return { data: { success: true, data: image } };
};

export const deleteImage = (id: string) =>
  api.delete<ApiResponse>(`/images/${id}`);
