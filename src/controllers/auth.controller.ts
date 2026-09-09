import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

// POST /auth/login
export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // TODO: validar el body (credenciales).
  // TODO: delegar en authService.login.
  // TODO: responder con el token generado.
}
