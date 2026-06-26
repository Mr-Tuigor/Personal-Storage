import { Request, Response, NextFunction } from 'express';
import { Password } from '../models/Password';
import { encrypt, decrypt } from '../services/crypto.service';
import { createPasswordSchema, updatePasswordSchema } from '../utils/validators';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { sendSuccess, sendPaginated, sendError, sendMessage } from '../utils/apiResponse';

export const getPasswords = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { skip, limit, page } = parsePagination(req.query as Record<string, string>);
    const userId = req.userId!;

    const [passwords, total] = await Promise.all([
      Password.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Password.countDocuments({ userId }),
    ]);

    // Return list WITHOUT decrypted passwords (just metadata)
    const safe = passwords.map((p) => ({
      _id: p._id,
      accountName: p.accountName,
      accountUsername: p.accountUsername,
      notes: p.notes,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    sendPaginated(res, safe, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const getPasswordById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const password = await Password.findOne({ _id: req.params.id, userId }).lean();

    if (!password) {
      sendError(res, 'Password entry not found.', 404);
      return;
    }

    // Decrypt the password for the response
    const decryptedPassword = decrypt(
      password.encryptedPassword,
      password.iv,
      password.authTag
    );

    sendSuccess(res, {
      _id: password._id,
      accountName: password.accountName,
      accountUsername: password.accountUsername,
      password: decryptedPassword,
      notes: password.notes,
      createdAt: password.createdAt,
      updatedAt: password.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const createPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { accountName, accountUsername, password, notes } =
      createPasswordSchema.parse(req.body);
    const userId = req.userId!;

    // Encrypt the password before storage
    const { ciphertext, iv, authTag } = encrypt(password);

    const entry = await Password.create({
      userId,
      accountName,
      accountUsername,
      encryptedPassword: ciphertext,
      iv,
      authTag,
      notes: notes || '',
    });

    sendSuccess(
      res,
      {
        _id: entry._id,
        accountName: entry.accountName,
        accountUsername: entry.accountUsername,
        notes: entry.notes,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updates = updatePasswordSchema.parse(req.body);
    const userId = req.userId!;

    const entry = await Password.findOne({ _id: req.params.id, userId });
    if (!entry) {
      sendError(res, 'Password entry not found.', 404);
      return;
    }

    if (updates.accountName !== undefined) entry.accountName = updates.accountName;
    if (updates.accountUsername !== undefined) entry.accountUsername = updates.accountUsername;
    if (updates.notes !== undefined) entry.notes = updates.notes;

    // Re-encrypt if password changed
    if (updates.password) {
      const { ciphertext, iv, authTag } = encrypt(updates.password);
      entry.encryptedPassword = ciphertext;
      entry.iv = iv;
      entry.authTag = authTag;
    }

    await entry.save();

    sendSuccess(res, {
      _id: entry._id,
      accountName: entry.accountName,
      accountUsername: entry.accountUsername,
      notes: entry.notes,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const entry = await Password.findOneAndDelete({ _id: req.params.id, userId });

    if (!entry) {
      sendError(res, 'Password entry not found.', 404);
      return;
    }

    sendMessage(res, 'Password entry deleted successfully.');
  } catch (error) {
    next(error);
  }
};
