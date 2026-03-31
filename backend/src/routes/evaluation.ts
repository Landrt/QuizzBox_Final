import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middlewares/auth';
import {
  createEvaluation,
  getUserEvaluations,
  getEvaluationById,
  generateAccessCode,
  joinEvaluation,
  deleteEvaluation,
  createQuestion,
  getQuestions,
} from '../services/evaluation.service';

const evaluationRoutes = Router();

// Create evaluation
evaluationRoutes.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, numQuestions, timePerQuestion, mode, visibility } = req.body;
    if (!title || !numQuestions || !timePerQuestion || !mode) {
      res.status(400).json({ message: 'Titre, nombre de questions, temps et mode sont requis.' });
      return;
    }
    const evaluation = await createEvaluation(req.userId!, {
      title, description, numQuestions, timePerQuestion, mode, visibility,
    });
    res.status(201).json(evaluation);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Get user's evaluations
evaluationRoutes.get('/user/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const evals = await getUserEvaluations(req.userId!);
    res.json(evals);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Join evaluation by code
evaluationRoutes.post('/join', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { accessCode } = req.body;
    if (!accessCode) {
      res.status(400).json({ message: 'Code d\'accès requis.' });
      return;
    }
    const evaluation = await joinEvaluation(accessCode);
    res.json(evaluation);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
});

// Get evaluation by ID
evaluationRoutes.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const evaluation = await getEvaluationById(req.params.id);
    if (!evaluation) {
      res.status(404).json({ message: 'Évaluation introuvable.' });
      return;
    }
    res.json(evaluation);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Generate access code
evaluationRoutes.post('/:id/generate-code', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await generateAccessCode(req.params.id, req.userId!);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Delete evaluation
evaluationRoutes.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await deleteEvaluation(req.params.id, req.userId!);
    res.json({ message: 'Évaluation supprimée.' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Add question to evaluation
evaluationRoutes.post('/:id/questions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { text, options } = req.body;
    if (!text || !options || options.length < 2) {
      res.status(400).json({ message: 'Texte de question et au moins 2 options sont requis.' });
      return;
    }
    const question = await createQuestion(req.params.id, { text, options });
    res.status(201).json(question);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Get questions of evaluation
evaluationRoutes.get('/:id/questions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const questions = await getQuestions(req.params.id);
    res.json(questions);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export { evaluationRoutes };