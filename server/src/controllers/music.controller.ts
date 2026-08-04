import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { MusicAlbum } from '../models/MusicAlbum';
import { MusicTrack } from '../models/MusicTrack';
import { getPresignedPutUrl, getPresignedDownloadUrl, deleteFromR2 } from '../services/r2.service';
import { createAlbumSchema, updateAlbumSchema } from '../utils/validators';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { sendSuccess, sendPaginated, sendError, sendMessage } from '../utils/apiResponse';
import { z } from 'zod';

const uploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  contentType: z.string().min(1, 'ContentType is required'),
  fileSize: z.number().positive().max(50 * 1024 * 1024, 'Audio exceeds 50MB limit'),
  trackName: z.string().min(1, 'Track name is required'),
  duration: z.number().optional(),
});

// ─── Albums ──────────────────────────────────────────────────────

export const getAlbums = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { skip, limit, page } = parsePagination(req.query as Record<string, string>);
    const userId = req.userId!;

    const [albums, total] = await Promise.all([
      MusicAlbum.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      MusicAlbum.countDocuments({ userId }),
    ]);

    // Fetch tracks for these albums
    const albumIds = albums.map(a => a._id);
    const tracks = await MusicTrack.find({ albumId: { $in: albumIds } }).sort({ createdAt: 1 }).lean();

    // Group tracks by albumId
    const albumsWithTracks = albums.map(album => {
      const albumTracks = tracks.filter(t => t.albumId.toString() === album._id.toString());
      return { ...album, tracks: albumTracks };
    });

    sendPaginated(res, albumsWithTracks, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const getAlbumById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const album = await MusicAlbum.findOne({ _id: req.params.id, userId }).lean();

    if (!album) {
      sendError(res, 'Album not found.', 404);
      return;
    }

    const tracks = await MusicTrack.find({ albumId: album._id }).sort({ createdAt: 1 }).lean();
    sendSuccess(res, { ...album, tracks });
  } catch (error) {
    next(error);
  }
};

export const createAlbum = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { albumName, artist } = createAlbumSchema.parse(req.body);
    const userId = req.userId!;

    const album = await MusicAlbum.create({ userId, albumName, artist });
    sendSuccess(res, { ...album.toJSON(), tracks: [] }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateAlbum = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updates = updateAlbumSchema.parse(req.body);
    const userId = req.userId!;

    const album = await MusicAlbum.findOneAndUpdate(
      { _id: req.params.id, userId },
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!album) {
      sendError(res, 'Album not found.', 404);
      return;
    }

    const tracks = await MusicTrack.find({ albumId: album._id }).sort({ createdAt: 1 }).lean();
    sendSuccess(res, { ...album, tracks });
  } catch (error) {
    next(error);
  }
};

export const deleteAlbum = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const album = await MusicAlbum.findOne({ _id: req.params.id, userId });

    if (!album) {
      sendError(res, 'Album not found.', 404);
      return;
    }

    const tracks = await MusicTrack.find({ albumId: album._id });

    // Delete all tracks from R2
    await Promise.all(tracks.map((track) => deleteFromR2(track.r2Key)));

    // Delete tracks from MongoDB
    await MusicTrack.deleteMany({ albumId: album._id });

    // Delete album from MongoDB
    await MusicAlbum.deleteOne({ _id: album._id });

    sendMessage(res, 'Album and all tracks deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// ─── Tracks ──────────────────────────────────────────────────────

export const getPresignedTrackData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const albumId = req.params.id;
    // We only need the file info for presigned URL
    const { filename, contentType } = req.body;

    if (!filename || !contentType) {
      sendError(res, 'filename and contentType are required.', 400);
      return;
    }

    const album = await MusicAlbum.findOne({ _id: albumId, userId }).lean();
    if (!album) {
      sendError(res, 'Album not found.', 404);
      return;
    }

    const uniqueId = crypto.randomUUID();
    const r2Key = `music/${userId}/${albumId}/${uniqueId}-${filename}`;

    // Get Presigned PUT URL
    const presignedUrl = await getPresignedPutUrl(r2Key, contentType);

    sendSuccess(res, { presignedUrl, r2Key });
  } catch (error) {
    next(error);
  }
};

const createTrackSchema = z.object({
  trackName: z.string().min(1, 'Track name is required'),
  r2Key: z.string().min(1, 'R2 Key is required'),
  duration: z.number().optional(),
});

export const createTrack = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const albumId = req.params.id;
    const { trackName, r2Key, duration } = createTrackSchema.parse(req.body);

    const album = await MusicAlbum.findOne({ _id: albumId, userId }).lean();
    if (!album) {
      sendError(res, 'Album not found.', 404);
      return;
    }

    // Fix missing slash
    const baseUrl = process.env.R2_PUBLIC_URL || '';
    const r2Url = baseUrl.endsWith('/') ? `${baseUrl}${r2Key}` : `${baseUrl}/${r2Key}`;

    await MusicTrack.create({
      userId,
      albumId,
      trackName,
      r2Key,
      r2Url,
      duration,
    });

    const tracks = await MusicTrack.find({ albumId: album._id }).sort({ createdAt: 1 }).lean();
    sendSuccess(res, { ...album, tracks }, 201);
  } catch (error) {
    next(error);
  }
};

export const deleteTrack = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id: albumId, trackId } = req.params;

    const track = await MusicTrack.findOne({ _id: trackId, albumId, userId });

    if (!track) {
      sendError(res, 'Track not found.', 404);
      return;
    }

    // Delete from R2
    await deleteFromR2(track.r2Key);

    // Remove from MongoDB
    await MusicTrack.deleteOne({ _id: track._id });

    sendMessage(res, 'Track deleted successfully.');
  } catch (error) {
    next(error);
  }
};

export const getTrackStreamUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id: albumId, trackId } = req.params;

    const track = await MusicTrack.findOne({ _id: trackId, albumId, userId }).lean();
    if (!track) {
      sendError(res, 'Track not found.', 404);
      return;
    }

    // Return the presigned URL for secure streaming
    const url = await getPresignedDownloadUrl(track.r2Key);
    sendSuccess(res, { url, trackName: track.trackName });
  } catch (error) {
    next(error);
  }
};

const moveTrackSchema = z.object({
  newAlbumId: z.string().min(1, 'New Album ID is required'),
});

export const moveTrack = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id: albumId, trackId } = req.params;
    const { newAlbumId } = moveTrackSchema.parse(req.body);

    const track = await MusicTrack.findOne({ _id: trackId, albumId, userId });

    if (!track) {
      sendError(res, 'Track not found.', 404);
      return;
    }
    
    const newAlbum = await MusicAlbum.findOne({ _id: newAlbumId, userId });
    
    if (!newAlbum) {
      sendError(res, 'New album not found.', 404);
      return;
    }

    track.albumId = newAlbum._id;
    await track.save();

    sendMessage(res, 'Track moved successfully.');
  } catch (error) {
    next(error);
  }
};
