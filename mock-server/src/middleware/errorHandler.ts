import { Request, Response, NextFunction } from 'express';
import { log } from './logger';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  log.error('Error occurred', err);

  // Default error response
  const status = (err as any).status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

// Custom error types
export class NotFoundError extends Error {
  status = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  status = 401;
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
