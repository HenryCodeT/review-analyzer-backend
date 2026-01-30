// Presentation: Middlewares

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../domain/exceptions';

function generateTraceId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `req-${timestamp}-${random}`;
}

export function responseWrapper(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const traceId = (req.headers['x-trace-id'] as string) || generateTraceId();
  const originalJson = res.json.bind(res);

  res.json = (body?: unknown) => {
    if (res.statusCode >= 400) {
      const errorBody = body as { error?: string; code?: string } | undefined;
      return originalJson({
        success: false,
        data: null,
        error: errorBody?.error || 'Error interno del servidor',
        code: errorBody?.code || 'INTERNAL_ERROR',
        traceId,
      });
    }

    return originalJson({
      success: true,
      data: body,
      error: null,
      code: null,
      traceId,
    });
  };

  next();
}

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`,
    );
  });

  next();
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }

  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

export function sanitizeInput(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] === '' || req.body[key] === undefined) {
        delete req.body[key];
      }
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
}
