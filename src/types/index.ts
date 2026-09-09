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

// Cuerpo de respuesta del endpoint GET /score/:rut.
export interface ScoreResponse {
  rut: string;
  score: number;
  fecha: string;
}

// La extensión de Express.Request para exponer `req.user` vive en
// ./express.d.ts (declaration merging global).
