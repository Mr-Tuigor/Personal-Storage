import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { DocumentModel } from '../models/Document';
import { DocumentFolder } from '../models/DocumentFolder';
import { getPresignedPutUrl, getPresignedDownloadUrl, deleteFromR2 } from '../services/r2.service';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { sendSuccess, sendPaginated, sendError, sendMessage } from '../utils/apiResponse';
import { createDocumentFolderSchema } from '../utils/validators';
import { z } from 'zod';

const uploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  contentType: z.string().min(1, 'ContentType is required'),
  fileSize: z.number().positive().max(20 * 1024 * 1024, 'File exceeds 20MB limit'),
  folderId: z.string().optional(),
});

// ─── Folders ──────────────────────────────────────────────────────

export const getDocumentFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const folders = await DocumentFolder.find({ userId }).sort({ createdAt: -1 }).lean();

    // Enrich with document count
    const enriched = await Promise.all(
      folders.map(async (folder) => {
        const fileCount = await DocumentModel.countDocuments({ userId, folderId: folder._id });
        return {
          ...folder,
          fileCount,
        };
      })
    );

    sendSuccess(res, enriched);
  } catch (error) {
    next(error);
  }
};

export const createDocumentFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { folderName, description } = createDocumentFolderSchema.parse(req.body);
    const userId = req.userId!;

    const folder = await DocumentFolder.create({ userId, folderName, description });
    sendSuccess(res, folder, 201);
  } catch (error) {
    next(error);
  }
};

export const deleteDocumentFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const folder = await DocumentFolder.findOne({ _id: req.params.id, userId });

    if (!folder) {
      sendError(res, 'Folder not found.', 404);
      return;
    }

    // Delete all documents in this folder from R2
    const docs = await DocumentModel.find({ userId, folderId: folder._id }).lean();
    await Promise.all(docs.map((doc) => deleteFromR2(doc.r2Key)));

    // Delete all document records and the folder
    await DocumentModel.deleteMany({ userId, folderId: folder._id });
    await DocumentFolder.deleteOne({ _id: folder._id });

    sendMessage(res, 'Folder and all its files deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// ─── Documents ───────────────────────────────────────────────────

export const getDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { skip, limit, page } = parsePagination(req.query as Record<string, string>);
    const userId = req.userId!;
    const folderId = req.query.folderId as string | undefined;

    const filter: Record<string, unknown> = { userId };
    if (folderId) {
      filter.folderId = folderId;
    } else {
      filter.folderId = { $exists: false }; // Root files
    }

    const [documents, total] = await Promise.all([
      DocumentModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DocumentModel.countDocuments(filter),
    ]);

    sendPaginated(res, documents, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { filename, contentType, fileSize, folderId } = uploadSchema.parse(req.body);

    if (folderId) {
      const folder = await DocumentFolder.findOne({ _id: folderId, userId });
      if (!folder) {
        sendError(res, 'Folder not found.', 404);
        return;
      }
    }

    const uniqueId = crypto.randomUUID();
    const r2Key = `documents/${userId}/${uniqueId}-${filename}`;

    const presignedUrl = await getPresignedPutUrl(r2Key, contentType);

    const r2Url = `${process.env.R2_PUBLIC_URL || ''}/${r2Key}`;
    
    const doc = await DocumentModel.create({
      userId,
      folderId: folderId || undefined,
      originalName: filename,
      r2Key,
      r2Url,
      fileType: contentType,
      fileSize: fileSize,
    });

    sendSuccess(res, { document: doc, presignedUrl }, 201);
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const doc = await DocumentModel.findOne({ _id: req.params.id, userId });

    if (!doc) {
      sendError(res, 'Document not found.', 404);
      return;
    }

    await deleteFromR2(doc.r2Key);
    await DocumentModel.deleteOne({ _id: doc._id });

    sendMessage(res, 'Document deleted successfully.');
  } catch (error) {
    next(error);
  }
};

export const downloadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const doc = await DocumentModel.findOne({ _id: req.params.id, userId }).lean();

    if (!doc) {
      sendError(res, 'Document not found.', 404);
      return;
    }

    const url = await getPresignedDownloadUrl(doc.r2Key);
    sendSuccess(res, { url, originalName: doc.originalName });
  } catch (error) {
    next(error);
  }
};
