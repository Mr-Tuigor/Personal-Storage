import { Request, Response, NextFunction } from 'express';
import { Note } from '../models/Note';
import { createNoteSchema, updateNoteSchema } from '../utils/validators';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { sendSuccess, sendPaginated, sendError, sendMessage } from '../utils/apiResponse';

export const getNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { skip, limit, page } = parsePagination(req.query as Record<string, string>);
    const userId = req.userId!;
    const tag = req.query.tag as string | undefined;

    const filter: Record<string, unknown> = { userId };
    if (tag) filter.tags = tag;

    const [notes, total] = await Promise.all([
      Note.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
      Note.countDocuments(filter),
    ]);

    sendPaginated(res, notes, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const note = await Note.findOne({ _id: req.params.id, userId }).lean();

    if (!note) {
      sendError(res, 'Note not found.', 404);
      return;
    }

    sendSuccess(res, note);
  } catch (error) {
    next(error);
  }
};

export const createNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, content, tags } = createNoteSchema.parse(req.body);
    const userId = req.userId!;

    const note = await Note.create({ userId, title, content, tags });
    sendSuccess(res, note, 201);
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updates = updateNoteSchema.parse(req.body);
    const userId = req.userId!;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId },
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!note) {
      sendError(res, 'Note not found.', 404);
      return;
    }

    sendSuccess(res, note);
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId });

    if (!note) {
      sendError(res, 'Note not found.', 404);
      return;
    }

    sendMessage(res, 'Note deleted successfully.');
  } catch (error) {
    next(error);
  }
};
