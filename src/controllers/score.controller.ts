import { Request, Response, NextFunction } from 'express';
import * as scoreService from '../services/score.service';

// GET /score/:rut
export async function getScore(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // TODO: leer y validar el RUT desde req.params.
  // TODO: delegar en scoreService.getScoreByRut.
  // TODO: responder con el score calculado.
}
