import { Router } from 'express';
import { EvaluationController } from '../controllers/evaluation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const evaluationController = new EvaluationController();

// Routes spécifiques (doivent venir en PREMIER avant /:id)
router.post('/', authMiddleware, evaluationController.create as any);
router.get('/user/me', authMiddleware, evaluationController.getByUser as any);
router.post('/join', authMiddleware, evaluationController.join as any);
router.post('/:id/generate-code', authMiddleware, evaluationController.generateCode as any);

// Route générique /:id (DOIT VENIR EN DERNIER)
router.get('/:id', authMiddleware, evaluationController.getById as any);
router.delete('/:id', authMiddleware, evaluationController.deleteEvaluation as any);

export default router;
