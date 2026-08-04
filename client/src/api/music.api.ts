import api from './client';
import axios from 'axios';
import type { MusicAlbum, ApiResponse, PaginatedResponse } from '../types';

export const getMusicAlbums = (page = 1, limit = 20) =>
  api.get<PaginatedResponse<MusicAlbum>>(`/music/albums?page=${page}&limit=${limit}`);

export const getMusicAlbumById = (id: string) =>
  api.get<ApiResponse<MusicAlbum>>(`/music/albums/${id}`);

export const createMusicAlbum = (data: { albumName: string; artist: string }) =>
  api.post<ApiResponse<MusicAlbum>>('/music/albums', data);

export const updateMusicAlbum = (id: string, data: { albumName?: string; artist?: string }) =>
  api.put<ApiResponse<MusicAlbum>>(`/music/albums/${id}`, data);

export const deleteMusicAlbum = (id: string) =>
  api.delete<ApiResponse>(`/music/albums/${id}`);

export const uploadTrack = async (
  albumId: string,
  file: File,
  trackName: string,
  duration?: number,
  onProgress?: (progress: number) => void
) => {
  // 1. Get presigned PUT URL from backend
  const presignedRes = await api.post<ApiResponse<{ presignedUrl: string; r2Key: string }>>(
    `/music/albums/${albumId}/tracks/presigned`,
    {
      filename: file.name,
      contentType: file.type || 'audio/mpeg',
    }
  );

  const { presignedUrl, r2Key } = presignedRes.data.data!;

  // 2. Upload file directly to R2 using PUT
  await axios.put(presignedUrl, file, {
    headers: {
      'Content-Type': file.type || 'audio/mpeg',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });

  // 3. Create the track in MongoDB
  const createRes = await api.post<ApiResponse<MusicAlbum>>(
    `/music/albums/${albumId}/tracks`,
    {
      trackName,
      r2Key,
      duration,
    }
  );

  return { data: createRes.data };
};

export const deleteTrack = (albumId: string, trackId: string) =>
  api.delete<ApiResponse>(`/music/albums/${albumId}/tracks/${trackId}`);

export const getTrackStreamUrl = (albumId: string, trackId: string) =>
  api.get<ApiResponse<{ url: string; trackName: string }>>(`/music/albums/${albumId}/tracks/${trackId}/stream`);

export const moveTrack = (albumId: string, trackId: string, newAlbumId: string) =>
  api.put<ApiResponse>(`/music/albums/${albumId}/tracks/${trackId}/move`, { newAlbumId });
