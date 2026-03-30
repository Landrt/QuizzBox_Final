import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import os from 'os';

import authRoutes from './routes/auth.routes';
import evaluationRoutes from './routes/evaluation.routes';
import questionRoutes from './routes/question.routes';
import sessionRoutes from './routes/session.routes';

import { errorHandler } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/logger.middleware';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 🔒 Sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.FRONTEND_URL || 'http://localhost:8080')
    : '*',
  credentials: true
}));

// Custom CSP configuration to allow external scripts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"] // Allow scripts from the same origin
    }
  }
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
app.listen(PORT, '0.0.0.0', () => {
  // Détection dynamique de l'IP locale
  const networkInterfaces = os.networkInterfaces();
  let LOCAL_IP = 'localhost';
  
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    if (interfaces) {
      for (const iface of interfaces) {
        if (iface.family === 'IPv4' && !iface.internal) {
          LOCAL_IP = iface.address;
          break;
        }
      }
    }
    if (LOCAL_IP !== 'localhost') break;
  }

  console.log('🧠 QuizzBox Backend');
  console.log('====================');
  console.log(`📡 Environnement: ${NODE_ENV}`);
  console.log(`🌐 Port: ${PORT}`);
  console.log(`🏠 Local: http://localhost:${PORT}`);
  console.log(`🔗 Réseau: http://${LOCAL_IP}:${PORT}`);
  console.log(`🏥 Health: http://${LOCAL_IP}:${PORT}/health`);
  console.log('====================');
});

export default app;
