"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionController = void 0;
const session_service_1 = require("../services/session.service");
const session_dto_1 = require("../dtos/session.dto");
const sessionService = new session_service_1.SessionService();
class SessionController {
    async start(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const validatedData = session_dto_1.StartSessionSchema.parse(req.body);
            const session = await sessionService.startSession(userId, validatedData.evaluationId);
            res.status(201).json(session);
        }
        catch (error) {
            if (error.name === 'ZodError')
                return res.status(400).json({ errors: error.errors });
            res.status(400).json({ message: error.message });
        }
    }
    async getCurrentQuestion(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const sessionId = req.params.id;
            const questionData = await sessionService.getCurrentQuestion(sessionId, userId);
            res.status(200).json(questionData);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async submitAnswer(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const sessionId = req.params.id;
            const validatedData = session_dto_1.SubmitAnswerSchema.parse(req.body);
            const result = await sessionService.submitAnswer(sessionId, userId, validatedData.optionId);
            res.status(200).json(result);
        }
        catch (error) {
            if (error.name === 'ZodError')
                return res.status(400).json({ errors: error.errors });
            res.status(400).json({ message: error.message });
        }
    }
    async getResult(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const sessionId = req.params.id;
            const result = await sessionService.getResult(sessionId, userId);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
exports.SessionController = SessionController;
