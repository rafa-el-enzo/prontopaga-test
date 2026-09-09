import { Request, Response, NextFunction } from 'express';
import { isValidRut } from '../utils/rut';
import { getScoreData } from '../services/score.service';

/**
 * GET /score/:rut
 * Valida el formato/DV del RUT y devuelve el score calculado.
 * El acceso ya fue resuelto por authenticate + authorize en la ruta.
 */
export const getScore = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const rutParam = req.params.rut;
    const rut = Array.isArray(rutParam) ? rutParam[0] : rutParam;

    if (!isValidRut(rut)) {
      res.status(400).json({ error: 'RUT inválido' });
      return;
    }

    const data = getScoreData(rut);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};
