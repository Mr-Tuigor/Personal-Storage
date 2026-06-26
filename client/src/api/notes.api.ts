import api from './client';
import type { Note, ApiResponse, PaginatedResponse } from '../types';

export const getNotes = (page = 1, limit = 20, tag?: string) => {
  let url = `/notes?page=${page}&limit=${limit}`;
  if (tag) url += `&tag=${encodeURIComponent(tag)}`;
  return api.get<PaginatedResponse<Note>>(url);
};

export const getNoteById = (id: string) =>
  api.get<ApiResponse<Note>>(`/notes/${id}`);

export const createNote = (data: { title: string; content?: string; tags?: string[] }) =>
  api.post<ApiResponse<Note>>('/notes', data);

export const updateNote = (id: string, data: { title?: string; content?: string; tags?: string[] }) =>
  api.put<ApiResponse<Note>>(`/notes/${id}`, data);

export const deleteNote = (id: string) =>
  api.delete<ApiResponse>(`/notes/${id}`);
