import { Request, Response, NextFunction } from 'express';

// Middleware de manejo de errores centralizado.
// Express lo reconoce como error handler por tener 4 parámetros.
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // TODO: normalizar el error a { status, message, details }.
  // TODO: loguear el error (con stack en desarrollo).
  // TODO: responder con el formato de error estándar de la API.
  res.status(500).json({ error: 'Internal Server Error' });
}

export default errorHandler;
