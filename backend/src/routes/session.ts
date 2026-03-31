import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth';
import {
  startSession,
  getCurrentQuestion,
  submitAnswer,
  getSessionResult,
} from '../services/session.service';

const sessionRoutes = Router();

// Start a new session
sessionRoutes.post('/start', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { evaluationId } = req.body;
    if (!evaluationId) {
      res.status(400).json({ message: 'evaluationId requis.' });
      return;
    }
    const session = await startSession(req.userId!, evaluationId);
    res.status(201).json(session);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Get current question
sessionRoutes.get('/:id/current-question', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = await getCurrentQuestion(req.params.id);
    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Submit an answer
sessionRoutes.post('/:id/answer', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { optionId } = req.body;
    const result = await submitAnswer(req.params.id, optionId || null);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Get session result
sessionRoutes.get('/:id/result', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await getSessionResult(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export { sessionRoutes };