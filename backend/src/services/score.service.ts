import { createHash } from 'crypto';
import { cleanRut, formatRut, isValidRut } from '../utils/rut';
import { ScoreResponse } from '../types';

/**
 * Calcula un score determinista (0-100) a partir de un RUT normalizado,
 * usando SHA-256 nativo de Node para garantizar buena distribución
 * sin implementar un algoritmo de hashing propio.
 */
export const calculateScore = (rut: string): number => {
  const clean = cleanRut(rut);
  const hash = createHash('sha256').update(clean).digest('hex');
  const num = parseInt(hash.substring(0, 8), 16);
  return num % 101; // rango 0-100
};

/**
 * Arma la respuesta completa del endpoint GET /score/:rut.
 * Lanza error si el RUT no es válido (el controller decide el status code).
 */
export const getScoreData = (rut: string): ScoreResponse => {
  if (!isValidRut(rut)) {
    throw new Error('RUT inválido');
  }

  return {
    rut: formatRut(cleanRut(rut)),
    score: calculateScore(rut),
    fecha: new Date().toISOString(),
  };
};
