import jwt from 'jsonwebtoken';
import { User, JwtPayload, Role } from '../types';

// Usuarios mock — no requiere persistencia en base de datos (según enunciado)
const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: '2',
    username: 'user1',
    password: 'user123',
    role: 'user',
    rut: '12.345.678-5',
  },
];

/**
 * Busca un usuario por credenciales exactas. Retorna null si no coincide.
 */
export const validateCredentials = (
  username: string,
  password: string
): User | null => {
  const user = MOCK_USERS.find(
    (u) => u.username === username && u.password === password
  );
  return user ?? null;
};

/**
 * Firma un JWT con el payload requerido: sub, role, y rut solo si
 * el rol es 'user' (regla explícita del enunciado).
 */
export const generateToken = (user: User): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '1h';

  if (!secret) {
    throw new Error('JWT_SECRET no está configurado');
  }

  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    sub: user.id,
    role: user.role as Role,
    ...(user.role === 'user' && { rut: user.rut }),
  };

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};
