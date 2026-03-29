import { Response } from 'express';
import { EvaluationService } from '../services/evaluation.service';
import { CreateEvaluationSchema, JoinEvaluationSchema } from '../dtos/evaluation.dto';
import { AuthRequest } from '../middlewares/auth.middleware';

const evaluationService = new EvaluationService();

export class EvaluationController {
  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const validatedData = CreateEvaluationSchema.parse(req.body);
      const evaluation = await evaluationService.createEvaluation(userId, validatedData);
      res.status(201).json(evaluation);
    } catch (error: any) {
      if (error.name === 'ZodError') return res.status(400).json({ errors: error.errors });
      res.status(400).json({ message: error.message });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const evaluation = await evaluationService.getEvaluation(id);
      res.status(200).json(evaluation);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async getByUser(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const evaluations = await evaluationService.getUserEvaluations(userId);
      res.status(200).json(evaluations);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async generateCode(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const id = req.params.id as string;
      const result = await evaluationService.generateCode(id, userId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async join(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const validatedData = JoinEvaluationSchema.parse(req.body);
      const evaluation = await evaluationService.joinEvaluation(userId, validatedData.accessCode);
      res.status(200).json(evaluation);
    } catch (error: any) {
      if (error.name === 'ZodError') return res.status(400).json({ errors: error.errors });
      res.status(400).json({ message: error.message });
    }
  }

  async deleteEvaluation(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const id = req.params.id as string;
      const result = await evaluationService.deleteEvaluation(userId, id);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
