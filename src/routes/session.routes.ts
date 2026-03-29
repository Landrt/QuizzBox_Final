import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const sessionController = new SessionController();

router.post('/start', authMiddleware, sessionController.start as any);
router.get('/:id/current-question', authMiddleware, sessionController.getCurrentQuestion as any);
router.post('/:id/answer', authMiddleware, sessionController.submitAnswer as any);
router.get('/:id/result', authMiddleware, sessionController.getResult as any);

export default router;
