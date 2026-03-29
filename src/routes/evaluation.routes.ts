import { Router } from 'express';
import { EvaluationController } from '../controllers/evaluation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const evaluationController = new EvaluationController();

router.post('/', authMiddleware, evaluationController.create as any);
router.get('/:id', authMiddleware, evaluationController.getById as any);
router.post('/:id/generate-code', authMiddleware, evaluationController.generateCode as any);
router.get('/user/me', authMiddleware, evaluationController.getByUser as any);
router.post('/join', authMiddleware, evaluationController.join as any);

export default router;
