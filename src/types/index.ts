// Tipos compartidos de la aplicación.

// TODO: ajustar los roles según el modelo de negocio real.
export type Role = 'admin' | 'user';

// Payload que viaja dentro del JWT.
export interface JwtPayload {
  sub: string;
  rut: string;
  role: Role;
  // TODO: agregar campos adicionales (iat, exp los agrega jsonwebtoken).
}

// Representación de un usuario dentro del sistema.
export interface User {
  id: string;
  rut: string;
  role: Role;
  // TODO: completar propiedades del usuario (nombre, email, hash de password, etc.).
}

// Augmenta el Request de Express para exponer el usuario autenticado.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
