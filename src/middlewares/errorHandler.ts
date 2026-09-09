import { Request, Response, NextFunction } from 'express';

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
}

/**
 * Middleware de manejo de errores centralizado (4 parámetros).
 * - Status: toma err.status / err.statusCode si es 4xx-5xx; si no, 500.
 * - Body: 4xx devuelve err.message; 5xx un mensaje genérico (no filtra internals).
 * - Loguea solo los 5xx (method, path y stack).
 */
export const errorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Si la respuesta ya empezó a enviarse, delega en el handler por defecto.
  if (res.headersSent) {
    next(err);
    return;
  }

  const rawStatus = err.status ?? err.statusCode;
  const status =
    typeof rawStatus === 'number' && rawStatus >= 400 && rawStatus <= 599
      ? rawStatus
      : 500;

  if (status >= 500) {
    // TODO: reemplazar por un logger real.
    console.error(`[error] ${req.method} ${req.originalUrl}`, err.stack ?? err);
  }

  const message =
    status >= 500 ? 'Error interno del servidor' : err.message || 'Solicitud inválida';

  res.status(status).json({ error: message });
};

export default errorHandler;
