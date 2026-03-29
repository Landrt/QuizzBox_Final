import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth.routes';
import evaluationRoutes from './routes/evaluation.routes';
import questionRoutes from './routes/question.routes';
import sessionRoutes from './routes/session.routes';

import { errorHandler } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/logger.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 🔒 Sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

// 🚦 Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: { error: 'Trop de requêtes, veuillez réessayer plus tard.' }
});
app.use('/api/', limiter);

// 📝 Parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 📊 Logger des requêtes
app.use(requestLogger);

// 🏥 Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// 🔗 Routes API
app.use('/api/auth', authRoutes);
app.use('/api/evaluation', evaluationRoutes);
app.use('/api/evaluation', questionRoutes);
app.use('/api/session', sessionRoutes);

// ❌ Gestion des routes API inexistantes
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ 
    success: false,
    error: 'Route API non trouvée',
    code: 'ROUTE_NOT_FOUND'
  });
});

// 📁 Fichiers statiques (frontend)
app.use(express.static(path.join(process.cwd(), 'frontend')));

// 🔄 Fallback SPA
app.use((_req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'frontend', 'index.html'));
});

// ❌ Gestion globale des erreurs
app.use(errorHandler);

// 🚀 Démarrage du serveur
app.listen(PORT, () => {
  console.log('🧠 QuizzBox Backend');
  console.log('====================');
  console.log(`📡 Environnement: ${NODE_ENV}`);
  console.log(`🌐 Port: ${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log('====================');
});

export default app;
