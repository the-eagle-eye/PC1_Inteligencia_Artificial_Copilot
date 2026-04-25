import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError, ValidationError } from '../../domain/errors/AppError';
import { logger } from '../../infrastructure/logging/logger';

export interface ErrorResponseBody {
  status: number;
  message: string;
  details?: unknown;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  let body: ErrorResponseBody;

  if (err instanceof ZodError) {
    body = {
      status: 400,
      message: 'Invalid request payload',
      details: err.flatten(),
    };
  } else if (err instanceof ValidationError) {
    body = { status: err.statusCode, message: err.message, details: err.details };
  } else if (err instanceof AppError) {
    body = { status: err.statusCode, message: err.message };
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      body = { status: 404, message: 'Resource not found' };
    } else if (err.code === 'P2002') {
      body = {
        status: 409,
        message: 'Unique constraint violation',
        details: { target: err.meta?.target },
      };
    } else {
      body = { status: 500, message: 'Database error', details: { code: err.code } };
    }
  } else {
    body = { status: 500, message: 'Internal server error' };
  }

  const logPayload = {
    route: `${req.method} ${req.originalUrl}`,
    status: body.status,
    err: { message: err.message, name: err.name, stack: err.stack },
  };

  if (body.status >= 500) {
    logger.error(logPayload, 'Unhandled error');
  } else {
    logger.warn(logPayload, 'Handled error');
  }

  res.status(body.status).json(body);
}

export function notFoundHandler(req: Request, res: Response): void {
  const body: ErrorResponseBody = {
    status: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  };
  res.status(404).json(body);
}
