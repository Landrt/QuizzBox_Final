"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluationService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const code_1 = require("../utils/code");
class EvaluationService {
    async createEvaluation(userId, data) {
        const evaluation = await prisma_1.default.evaluation.create({
            data: {
                ...data,
                creatorId: userId,
                accessCode: data.visibility === 'SHARED' ? (0, code_1.generateAccessCode)() : null,
                processingStatus: data.mode === 'AI' ? 'pending' : null,
            },
        });
        return evaluation;
    }
    async getUserEvaluations(userId) {
        return await prisma_1.default.evaluation.findMany({
            where: { creatorId: userId },
            include: {
                _count: {
                    select: { questions: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getEvaluation(id) {
        const evaluation = await prisma_1.default.evaluation.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
                _count: {
                    select: { questions: true },
                },
            },
        });
        if (!evaluation) {
            throw new Error('Evaluation not found');
        }
        return evaluation;
    }
    async generateCode(id, userId) {
        const evaluation = await prisma_1.default.evaluation.findUnique({
            where: { id },
        });
        if (!evaluation) {
            throw new Error('Evaluation not found');
        }
        if (evaluation.creatorId !== userId) {
            throw new Error('Only the creator can generate an access code');
        }
        const updated = await prisma_1.default.evaluation.update({
            where: { id },
            data: {
                accessCode: (0, code_1.generateAccessCode)(),
                visibility: 'SHARED',
            },
        });
        return { accessCode: updated.accessCode };
    }
    async joinEvaluation(userId, accessCode) {
        const evaluation = await prisma_1.default.evaluation.findUnique({
            where: { accessCode },
        });
        if (!evaluation) {
            throw new Error('Invalid access code');
        }
        // In this platform, joining usually means being able to start a session.
        // We could return the evaluation details so the frontend can then call /sessions/start
        return evaluation;
    }
    async deleteEvaluation(userId, id) {
        const evaluation = await prisma_1.default.evaluation.findUnique({
            where: { id },
        });
        if (!evaluation) {
            throw new Error('Evaluation not found');
        }
        if (evaluation.creatorId !== userId) {
            throw new Error('Only the creator can delete this evaluation');
        }
        await prisma_1.default.evaluation.delete({
            where: { id },
        });
        return { success: true };
    }
}
exports.EvaluationService = EvaluationService;
