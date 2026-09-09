import { Router } from 'express';
import * as scoreController from '../controllers/score.controller';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/authorize';

const router = Router();

router.get('/:rut', authenticate, authorize, scoreController.getScore);

export default router;
