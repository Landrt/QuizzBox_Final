import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from 'dotenv';
import { authRoutes } from './routes/auth';
import { evaluationRoutes } from './routes/evaluation';
import { sessionRoutes } from './routes/session';
import { errorHandler } from './middlewares/errorHandler';

config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware — disable helmet's contentSecurityPolicy for frontend dev
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Trop de requêtes depuis cette IP. Réessayez plus tard.'
});
app.use('/api', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/evaluation', evaluationRoutes);
app.use('/api/session', sessionRoutes);

// Serve static frontend files
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Catch-all: serve index.html for any unknown routes (SPA fallback)
app.get('*', (req, res) => {
  // If it's an API call, return 404 JSON
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'Route not found' });
    return;
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Serveur QuizzBox démarré sur http://localhost:${PORT}`);
  console.log(`📁 Frontend servi depuis: ${frontendPath}`);
});