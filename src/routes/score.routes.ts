import { Router } from 'express';
import * as scoreController from '../controllers/score.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';

const router = Router();

// TODO: GET /:rut -> scoreController.getScore
//       protegido por authenticate + authorize (p. ej. authorize('admin')).
// router.get('/:rut', authenticate, authorize('admin'), scoreController.getScore);

export default router;
