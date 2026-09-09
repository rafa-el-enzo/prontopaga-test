import { Request, Response, NextFunction } from 'express';
import { Role } from '../types';

// Middleware placeholder: valida el rol y/o el RUT del usuario autenticado.
// Se usa como fábrica: authorize('admin') -> RequestHandler.
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // TODO: verificar que req.user exista (el middleware auth debe correr antes).
    // TODO: comparar req.user.role contra allowedRoles.
    // TODO: opcionalmente validar que el RUT del recurso (req.params.rut)
    //       coincida con req.user.rut cuando el rol no es admin.
    // TODO: responder 403 si el usuario no está autorizado.
    next();
  };
}

export default authorize;
