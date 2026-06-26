import { Request, Response, NextFunction } from 'express';
import { DocumentModel } from '../models/Document';
import { Image, ImageAlbum } from '../models/Image';
import { MusicAlbum } from '../models/MusicAlbum';
import { Note } from '../models/Note';
import { Password } from '../models/Password';
import { sendSuccess } from '../utils/apiResponse';

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;

    const [totalFiles, totalImages, totalAlbums, totalMusicAlbums, totalNotes, totalPasswords] =
      await Promise.all([
        DocumentModel.countDocuments({ userId }),
        Image.countDocuments({ userId }),
        ImageAlbum.countDocuments({ userId }),
        MusicAlbum.countDocuments({ userId }),
        Note.countDocuments({ userId }),
        Password.countDocuments({ userId }),
      ]);

    sendSuccess(res, {
      totalFiles,
      totalImages,
      totalAlbums,
      totalMusicAlbums,
      totalNotes,
      totalPasswords,
    });
  } catch (error) {
    next(error);
  }
};
