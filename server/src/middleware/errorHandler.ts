import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

/**
 * Global error handler — catches Zod, Mongoose, Multer, and generic errors
 * and returns a standardized API response.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[ERROR] ${err.name}: ${err.message}`);

  // Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: messages,
    });
    return;
  }

  // Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: messages,
    });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      error: `Invalid ${err.path}: ${String(err.value)}`,
    });
    return;
  }

  // Mongoose duplicate key error
  if (err.name === 'MongoServerError' && (err as unknown as Record<string, unknown>).code === 11000) {
    res.status(409).json({
      success: false,
      error: 'A record with this value already exists.',
    });
    return;
  }

  // Multer file size error
  if (err.name === 'MulterError') {
    res.status(400).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Multer file type rejection (custom Error thrown from fileFilter)
  if (err.message.startsWith('Invalid file type')) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Generic fallback
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};
