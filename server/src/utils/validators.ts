import { z } from 'zod';

// ─── Auth ────────────────────────────────────────────────────────

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

// ─── Password Vault ──────────────────────────────────────────────

export const createPasswordSchema = z.object({
  accountName: z.string().min(1, 'Account name is required').trim(),
  accountUsername: z.string().min(1, 'Account username is required').trim(),
  password: z.string().min(1, 'Password is required'),
  notes: z.string().optional(),
});

export const updatePasswordSchema = z.object({
  accountName: z.string().min(1).trim().optional(),
  accountUsername: z.string().min(1).trim().optional(),
  password: z.string().min(1).optional(),
  notes: z.string().optional(),
});

// ─── Notes ───────────────────────────────────────────────────────

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).trim(),
  content: z.string().optional().default(''),
  tags: z.array(z.string().trim()).optional().default([]),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  content: z.string().optional(),
  tags: z.array(z.string().trim()).optional(),
});

// ─── Music Albums ────────────────────────────────────────────────

export const createAlbumSchema = z.object({
  albumName: z.string().min(1, 'Album name is required').trim(),
  artist: z.string().min(1, 'Artist name is required').trim(),
});

export const updateAlbumSchema = z.object({
  albumName: z.string().min(1).trim().optional(),
  artist: z.string().min(1).trim().optional(),
});

// ─── Image Albums ────────────────────────────────────────────────

export const createImageAlbumSchema = z.object({
  albumName: z.string().min(1, 'Album name is required').trim(),
  description: z.string().optional(),
});

// ─── Document Folders ────────────────────────────────────────────

export const createDocumentFolderSchema = z.object({
  folderName: z.string().min(1, 'Folder name is required').max(50).trim(),
  description: z.string().max(200).optional(),
});
