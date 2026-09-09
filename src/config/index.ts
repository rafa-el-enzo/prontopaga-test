import dotenv from 'dotenv';

dotenv.config();

// TODO: validar que las variables de entorno requeridas estén presentes
//       y lanzar un error temprano si falta alguna (fail-fast).

export const config = {
  port: process.env.PORT ?? '3000',
  jwtSecret: process.env.JWT_SECRET ?? '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
};

export default config;
