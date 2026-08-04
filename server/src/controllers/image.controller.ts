import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Image, ImageAlbum } from '../models/Image';
import { getPresignedPutUrl, deleteFromR2 } from '../services/r2.service';
import { createImageAlbumSchema } from '../utils/validators';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { sendSuccess, sendPaginated, sendError, sendMessage } from '../utils/apiResponse';
import { z } from 'zod';

const uploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  contentType: z.string().min(1, 'ContentType is required'),
  fileSize: z.number().positive().max(15 * 1024 * 1024, 'Image exceeds 15MB limit'),
  albumId: z.string().optional(),
});

// ─── Image Albums ────────────────────────────────────────────────

export const getImageAlbums = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const albums = await ImageAlbum.find({ userId }).sort({ createdAt: -1 }).lean();

    // Enrich with image count and cover image
    const enriched = await Promise.all(
      albums.map(async (album) => {
        const imageCount = await Image.countDocuments({ userId, albumId: album._id });
        const coverImg = await Image.findOne({ userId, albumId: album._id })
          .sort({ createdAt: -1 })
          .select('r2Url')
          .lean();
        return {
          ...album,
          imageCount,
          coverImage: coverImg?.r2Url || null,
        };
      })
    );

    sendSuccess(res, enriched);
  } catch (error) {
    next(error);
  }
};

export const createImageAlbum = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { albumName, description } = createImageAlbumSchema.parse(req.body);
    const userId = req.userId!;

    const album = await ImageAlbum.create({ userId, albumName, description });
    sendSuccess(res, album, 201);
  } catch (error) {
    next(error);
  }
};

export const deleteImageAlbum = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const album = await ImageAlbum.findOne({ _id: req.params.id, userId });

    if (!album) {
      sendError(res, 'Album not found.', 404);
      return;
    }

    // Delete all images in this album from R2
    const images = await Image.find({ userId, albumId: album._id }).lean();
    await Promise.all(images.map((img) => deleteFromR2(img.r2Key)));

    // Delete all image records and the album
    await Image.deleteMany({ userId, albumId: album._id });
    await ImageAlbum.deleteOne({ _id: album._id });

    sendMessage(res, 'Album and all its images deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// ─── Images ──────────────────────────────────────────────────────

export const getImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { skip, limit, page } = parsePagination(req.query as Record<string, string>);
    const userId = req.userId!;
    const albumId = req.query.albumId as string | undefined;

    const filter: Record<string, unknown> = { userId };
    if (albumId) filter.albumId = albumId;

    const [images, total] = await Promise.all([
      Image.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Image.countDocuments(filter),
    ]);

    sendPaginated(res, images, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { filename, contentType, fileSize, albumId } = uploadSchema.parse(req.body);

    // Validate album ownership if albumId is provided
    if (albumId) {
      const album = await ImageAlbum.findOne({ _id: albumId, userId });
      if (!album) {
        sendError(res, 'Album not found or does not belong to you.', 404);
        return;
      }
    }

    const uniqueId = crypto.randomUUID();
    const r2Key = `images/${userId}/${uniqueId}-${filename}`;
    
    // Get Presigned PUT URL
    const presignedUrl = await getPresignedPutUrl(r2Key, contentType);
    
    const r2Url = `${process.env.R2_PUBLIC_URL || ''}/${r2Key}`;

    const image = await Image.create({
      userId,
      albumId: albumId || null,
      originalName: filename,
      r2Key,
      r2Url,
      fileSize: fileSize,
    });

    sendSuccess(res, { image, presignedUrl }, 201);
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const image = await Image.findOne({ _id: req.params.id, userId });

    if (!image) {
      sendError(res, 'Image not found.', 404);
      return;
    }

    await deleteFromR2(image.r2Key);
    await Image.deleteOne({ _id: image._id });

    sendMessage(res, 'Image deleted successfully.');
  } catch (error) {
    next(error);
  }
};

const moveImageSchema = z.object({
  newAlbumId: z.string().optional().nullable(),
});

export const moveImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { newAlbumId } = moveImageSchema.parse(req.body);

    const image = await Image.findOne({ _id: id, userId });

    if (!image) {
      sendError(res, 'Image not found.', 404);
      return;
    }

    if (newAlbumId) {
      const album = await ImageAlbum.findOne({ _id: newAlbumId, userId });
      if (!album) {
        sendError(res, 'Album not found.', 404);
        return;
      }
      image.albumId = album._id as any;
    } else {
      image.albumId = null as any;
    }

    await image.save();
    sendMessage(res, 'Image moved successfully.');
  } catch (error) {
    next(error);
  }
};
