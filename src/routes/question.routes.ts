import { Router } from 'express';
import { QuestionController } from '../controllers/question.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const questionController = new QuestionController();

router.post('/:id/questions', authMiddleware, questionController.create as any);
router.get('/:id/questions', authMiddleware, questionController.getByEvaluation as any);

export default router;
