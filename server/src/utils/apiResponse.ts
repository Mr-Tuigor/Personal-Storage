import { Response } from 'express';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({
    success: true,
    data,
  });
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta
): void {
  res.status(200).json({
    success: true,
    data,
    pagination,
  });
}

export function sendError(
  res: Response,
  error: string,
  statusCode = 400
): void {
  res.status(statusCode).json({
    success: false,
    error,
  });
}

export function sendMessage(
  res: Response,
  message: string,
  statusCode = 200
): void {
  res.status(statusCode).json({
    success: true,
    message,
  });
}
