import { Response } from 'express';
import { QuestionService } from '../services/question.service';
import { CreateQuestionSchema } from '../dtos/question.dto';
import { AuthRequest } from '../middlewares/auth.middleware';

const questionService = new QuestionService();

export class QuestionController {
  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const evaluationId = req.params.id as string;
      const validatedData = CreateQuestionSchema.parse(req.body);
      
      const question = await questionService.createQuestion(evaluationId, userId, validatedData);
      res.status(201).json(question);
    } catch (error: any) {
      if (error.name === 'ZodError') return res.status(400).json({ errors: error.errors });
      res.status(400).json({ message: error.message });
    }
  }

  async getByEvaluation(req: AuthRequest, res: Response) {
    try {
      const evaluationId = req.params.id as string;
      const questions = await questionService.getQuestions(evaluationId);
      res.status(200).json(questions);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
