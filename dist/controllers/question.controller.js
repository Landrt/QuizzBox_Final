"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionController = void 0;
const question_service_1 = require("../services/question.service");
const question_dto_1 = require("../dtos/question.dto");
const questionService = new question_service_1.QuestionService();
class QuestionController {
    async create(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const evaluationId = req.params.id;
            const validatedData = question_dto_1.CreateQuestionSchema.parse(req.body);
            const question = await questionService.createQuestion(evaluationId, userId, validatedData);
            res.status(201).json(question);
        }
        catch (error) {
            if (error.name === 'ZodError')
                return res.status(400).json({ errors: error.errors });
            res.status(400).json({ message: error.message });
        }
    }
    async getByEvaluation(req, res) {
        try {
            const evaluationId = req.params.id;
            const questions = await questionService.getQuestions(evaluationId);
            res.status(200).json(questions);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
exports.QuestionController = QuestionController;
