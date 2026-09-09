import { Request, Response, NextFunction } from 'express';

// Middleware placeholder: valida el JWT enviado en el header Authorization.
export function auth(req: Request, res: Response, next: NextFunction): void {
  // TODO: extraer el token del header "Authorization: Bearer <token>".
  // TODO: verificar el token con jwt.verify usando config.jwtSecret.
  // TODO: asignar el payload decodificado a req.user.
  // TODO: responder 401 si el token falta o es inválido.
  next();
}

export default auth;
