"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const evaluation_controller_1 = require("../controllers/evaluation.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const evaluationController = new evaluation_controller_1.EvaluationController();
// Routes spécifiques (doivent venir en PREMIER avant /:id)
router.post('/', auth_middleware_1.authMiddleware, evaluationController.create);
router.get('/user/me', auth_middleware_1.authMiddleware, evaluationController.getByUser);
router.post('/join', auth_middleware_1.authMiddleware, evaluationController.join);
router.post('/:id/generate-code', auth_middleware_1.authMiddleware, evaluationController.generateCode);
// Route générique /:id (DOIT VENIR EN DERNIER)
router.get('/:id', auth_middleware_1.authMiddleware, evaluationController.getById);
router.delete('/:id', auth_middleware_1.authMiddleware, evaluationController.deleteEvaluation);
exports.default = router;
