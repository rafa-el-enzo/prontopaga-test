import { Request, Response, NextFunction } from 'express';
import { validateCredentials, generateToken } from '../services/auth.service';

const ALLOWED_FIELDS = ['username', 'password'];

/**
 * POST /auth/login
 * Valida estrictamente el body { username, password }, verifica las
 * credenciales contra los usuarios mock y devuelve { token }.
 */
export const login = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const body = req.body;

    // Body debe ser un objeto plano.
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      res
        .status(422)
        .json({ error: 'El body debe ser un objeto JSON con username y password' });
      return;
    }

    // Solo se aceptan username y password, ambos como string.
    const hasUnknownField = Object.keys(body).some(
      (key) => !ALLOWED_FIELDS.includes(key)
    );

    if (
      hasUnknownField ||
      typeof body.username !== 'string' ||
      typeof body.password !== 'string'
    ) {
      res.status(422).json({
        error: 'El body debe contener únicamente username y password como strings',
      });
      return;
    }

    const username = body.username.trim();
    const password = body.password;

    if (username.length === 0 || password.length === 0) {
      res.status(422).json({ error: 'username y password no pueden estar vacíos' });
      return;
    }

    const user = validateCredentials(username, password);

    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const token = generateToken(user);
    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};
