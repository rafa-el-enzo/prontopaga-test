import { JwtPayload, User } from '../types';

// Autentica a un usuario y devuelve un token firmado.
export async function login(rut: string, password: string): Promise<{ token: string }> {
  // TODO: buscar el usuario por RUT.
  // TODO: verificar la contraseña.
  // TODO: firmar el JWT con jwt.sign(payload, secret, { expiresIn }).
  throw new Error('Not implemented');
}

// Verifica un token y devuelve su payload.
export function verifyToken(token: string): JwtPayload {
  // TODO: jwt.verify(token, secret) y devolver el payload tipado.
  throw new Error('Not implemented');
}
