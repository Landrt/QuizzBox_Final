"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const evaluation_routes_1 = __importDefault(require("./routes/evaluation.routes"));
const question_routes_1 = __importDefault(require("./routes/question.routes"));
const session_routes_1 = __importDefault(require("./routes/session.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const logger_middleware_1 = require("./middlewares/logger.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
// 🔒 Sécurité
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
}));
// 🚦 Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: { error: 'Trop de requêtes, veuillez réessayer plus tard.' }
});
app.use('/api/', limiter);
// 📝 Parsing JSON
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// 📊 Logger des requêtes
app.use(logger_middleware_1.requestLogger);
// 🏥 Health check
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV
    });
});
// 🔗 Routes API
app.use('/api/auth', auth_routes_1.default);
app.use('/api/evaluation', evaluation_routes_1.default);
app.use('/api/evaluation', question_routes_1.default);
app.use('/api/session', session_routes_1.default);
// ❌ Gestion des routes API inexistantes
app.use('/api', (_req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route API non trouvée',
        code: 'ROUTE_NOT_FOUND'
    });
});
// 📁 Fichiers statiques (frontend)
app.use(express_1.default.static(path_1.default.join(process.cwd(), 'frontend')));
// 🔄 Fallback SPA
app.use((_req, res) => {
    res.sendFile(path_1.default.join(process.cwd(), 'frontend', 'index.html'));
});
// ❌ Gestion globale des erreurs
app.use(error_middleware_1.errorHandler);
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
exports.default = app;
