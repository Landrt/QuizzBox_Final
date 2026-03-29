"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluationController = void 0;
const evaluation_service_1 = require("../services/evaluation.service");
const evaluation_dto_1 = require("../dtos/evaluation.dto");
const evaluationService = new evaluation_service_1.EvaluationService();
class EvaluationController {
    async create(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const validatedData = evaluation_dto_1.CreateEvaluationSchema.parse(req.body);
            const evaluation = await evaluationService.createEvaluation(userId, validatedData);
            res.status(201).json(evaluation);
        }
        catch (error) {
            if (error.name === 'ZodError')
                return res.status(400).json({ errors: error.errors });
            res.status(400).json({ message: error.message });
        }
    }
    async getById(req, res) {
        try {
            const id = req.params.id;
            const evaluation = await evaluationService.getEvaluation(id);
            res.status(200).json(evaluation);
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
    async getByUser(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const evaluations = await evaluationService.getUserEvaluations(userId);
            res.status(200).json(evaluations);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async generateCode(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const id = req.params.id;
            const result = await evaluationService.generateCode(id, userId);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async join(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const validatedData = evaluation_dto_1.JoinEvaluationSchema.parse(req.body);
            const evaluation = await evaluationService.joinEvaluation(userId, validatedData.accessCode);
            res.status(200).json(evaluation);
        }
        catch (error) {
            if (error.name === 'ZodError')
                return res.status(400).json({ errors: error.errors });
            res.status(400).json({ message: error.message });
        }
    }
    async deleteEvaluation(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const id = req.params.id;
            const result = await evaluationService.deleteEvaluation(userId, id);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
exports.EvaluationController = EvaluationController;
