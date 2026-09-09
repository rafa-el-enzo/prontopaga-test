import { Router } from 'express';
import * as scoreController from '../controllers/score.controller';
import { auth } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';

const router = Router();

// TODO: GET /:rut -> scoreController.getScore
//       protegido por auth + authorize (p. ej. authorize('admin')).
// router.get('/:rut', auth, authorize('admin'), scoreController.getScore);

export default router;
