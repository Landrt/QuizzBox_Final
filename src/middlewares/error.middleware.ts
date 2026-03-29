import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur serveur interne';
  const code = err.code || 'INTERNAL_ERROR';

  console.error(`[ERROR] ${code}: ${message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    code,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const createError = (message: string, statusCode: number, code?: string): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code || `ERROR_${statusCode}`;
  return error;
};
