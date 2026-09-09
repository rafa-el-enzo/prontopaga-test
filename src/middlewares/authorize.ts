import { Request, Response, NextFunction } from 'express';
import { rutsAreEqual } from '../utils/rut';

/**
 * Autoriza el acceso a GET /score/:rut según el rol del usuario:
 * - admin: acceso sin restricción a cualquier RUT.
 * - user: solo puede consultar el RUT que coincide con el de su token.
 * Debe ejecutarse DESPUÉS de authenticate (requiere req.user ya presente).
 */
export const authorize = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = req.user;

  if (!user) {
    // Caso defensivo: no debería ocurrir si authenticate corrió antes,
    // pero evita un crash si el orden de middlewares se altera.
    res.status(401).json({ error: 'No autenticado' });
    return;
  }

  if (user.role === 'admin') {
    next();
    return;
  }

  // role === 'user'
  const rutParam = req.params.rut;
  const requestedRut = Array.isArray(rutParam) ? rutParam[0] : rutParam;

  if (!user.rut || !rutsAreEqual(user.rut, requestedRut)) {
    res.status(403).json({ error: 'No autorizado para consultar este RUT' });
    return;
  }

  next();
};
