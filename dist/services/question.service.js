"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class QuestionService {
    async createQuestion(evaluationId, userId, data) {
        const evaluation = await prisma_1.default.evaluation.findUnique({
            where: { id: evaluationId },
        });
        if (!evaluation) {
            throw new Error('Evaluation not found');
        }
        if (evaluation.creatorId !== userId) {
            throw new Error('Only the creator can add questions');
        }
        const question = await prisma_1.default.question.create({
            data: {
                text: data.text,
                evaluationId,
                options: {
                    create: data.options.map((opt) => ({
                        text: opt.text,
                        isCorrect: opt.isCorrect,
                    })),
                },
            },
            include: {
                options: true,
            },
        });
        return question;
    }
    async getQuestions(evaluationId) {
        const questions = await prisma_1.default.question.findMany({
            where: { evaluationId },
            include: {
                options: true,
            },
        });
        return questions;
    }
}
exports.QuestionService = QuestionService;
