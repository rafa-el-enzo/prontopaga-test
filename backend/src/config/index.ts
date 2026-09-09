import dotenv from 'dotenv';

dotenv.config();

// Fail-fast: sin JWT_SECRET el server no debe levantar.
if (!process.env.JWT_SECRET) {
  throw new Error('Falta la variable de entorno requerida: JWT_SECRET');
}

export const config = {
  port: process.env.PORT ?? '3000',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
};

export default config;
