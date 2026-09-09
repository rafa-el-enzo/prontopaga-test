import { JwtPayload } from './index';

// Declaration merging: extiende el Request de Express para exponer el
// usuario autenticado. `user` es opcional porque solo se asigna después
// de pasar por el middleware de autenticación.
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
