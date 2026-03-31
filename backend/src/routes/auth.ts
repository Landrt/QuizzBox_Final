import { Router, Request, Response } from 'express';
import { registerUser, loginUser, getUserProfile } from '../services/auth.service';
import { authMiddleware, AuthRequest } from '../middlewares/auth';

const authRoutes = Router();

authRoutes.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
      res.status(400).json({ message: 'Email, mot de passe et nom complet sont requis.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }
    const result = await registerUser({ email, password, fullName });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

authRoutes.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email et mot de passe requis.' });
      return;
    }
    const result = await loginUser({ email, password });
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
});

authRoutes.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getUserProfile(req.userId!);
    res.json(user);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
});

export { authRoutes };