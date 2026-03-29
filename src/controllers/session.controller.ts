import { Response } from 'express';
import { SessionService } from '../services/session.service';
import { StartSessionSchema, SubmitAnswerSchema } from '../dtos/session.dto';
import { AuthRequest } from '../middlewares/auth.middleware';

const sessionService = new SessionService();

export class SessionController {
  async start(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const validatedData = StartSessionSchema.parse(req.body);
      const session = await sessionService.startSession(userId, validatedData.evaluationId);
      res.status(201).json(session);
    } catch (error: any) {
      if (error.name === 'ZodError') return res.status(400).json({ errors: error.errors });
      res.status(400).json({ message: error.message });
    }
  }

  async getCurrentQuestion(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const sessionId = req.params.id as string;
      const questionData = await sessionService.getCurrentQuestion(sessionId, userId);
      res.status(200).json(questionData);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async submitAnswer(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const sessionId = req.params.id as string;
      const validatedData = SubmitAnswerSchema.parse(req.body);
      
      const result = await sessionService.submitAnswer(sessionId, userId, validatedData.optionId);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') return res.status(400).json({ errors: error.errors });
      res.status(400).json({ message: error.message });
    }
  }

  async getResult(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const sessionId = req.params.id as string;
      const result = await sessionService.getResult(sessionId, userId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
