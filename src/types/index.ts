// Tipos compartidos de la aplicación.

// TODO: ajustar los roles según el modelo de negocio real.
export type Role = 'admin' | 'user';

// Payload que viaja dentro del JWT.
export interface JwtPayload {
  sub: string;
  role: Role;
  rut?: string; // presente solo cuando role === 'user'
  // iat / exp los agrega jsonwebtoken al firmar.
}

// Representación de un usuario dentro del sistema.
export interface User {
  id: string;
  username: string;
  password: string;
  role: Role;
  rut?: string; // solo los usuarios con role 'user' lo tienen
}

// Cuerpo de respuesta del endpoint GET /score/:rut.
export interface ScoreResponse {
  rut: string;
  score: number;
  fecha: string;
}

// La extensión de Express.Request para exponer `req.user` vive en
// ./express.d.ts (declaration merging global).
