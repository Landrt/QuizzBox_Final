"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class SessionService {
    async startSession(userId, evaluationId) {
        // Check if evaluation exists
        const evaluation = await prisma_1.default.evaluation.findUnique({
            where: { id: evaluationId },
            include: { _count: { select: { questions: true } } }
        });
        if (!evaluation) {
            throw new Error('Evaluation not found');
        }
        if (evaluation._count.questions === 0) {
            throw new Error('This evaluation has no questions yet');
        }
        // Create session
        const session = await prisma_1.default.evaluationSession.create({
            data: {
                userId,
                evaluationId,
                status: 'IN_PROGRESS',
                currentQuestionIndex: 0,
            },
        });
        return session;
    }
    async getCurrentQuestion(sessionId, userId) {
        const session = await prisma_1.default.evaluationSession.findUnique({
            where: { id: sessionId },
            include: {
                evaluation: {
                    include: {
                        questions: {
                            orderBy: { id: 'asc' }, // Ensure consistent ordering
                            include: { options: true }
                        }
                    }
                }
            }
        });
        if (!session || session.userId !== userId) {
            throw new Error('Session not found');
        }
        if (session.status === 'COMPLETED') {
            throw new Error('Session is already completed');
        }
        const question = session.evaluation.questions[session.currentQuestionIndex];
        if (!question) {
            // No more questions, auto-complete
            await this.completeSession(sessionId);
            throw new Error('No more questions');
        }
        // Set start time for this question if not already set for this index
        if (!session.currentQuestionStartTime) {
            await prisma_1.default.evaluationSession.update({
                where: { id: sessionId },
                data: { currentQuestionStartTime: new Date() }
            });
        }
        // Don't return isCorrect in options to prevent cheating
        const safeOptions = question.options.map(({ id, text }) => ({ id, text }));
        return {
            question: {
                id: question.id,
                text: question.text,
                options: safeOptions,
            },
            timeLimit: session.evaluation.timePerQuestion,
            currentIndex: session.currentQuestionIndex,
            totalQuestions: session.evaluation.numQuestions
        };
    }
    async submitAnswer(sessionId, userId, optionId) {
        const session = await prisma_1.default.evaluationSession.findUnique({
            where: { id: sessionId },
            include: {
                evaluation: {
                    include: {
                        questions: {
                            orderBy: { id: 'asc' },
                            include: { options: true }
                        }
                    }
                }
            }
        });
        if (!session || session.userId !== userId) {
            throw new Error('Session not found');
        }
        if (session.status === 'COMPLETED') {
            throw new Error('Session is already completed');
        }
        if (!session.currentQuestionStartTime) {
            throw new Error('Question was not served yet');
        }
        const question = session.evaluation.questions[session.currentQuestionIndex];
        // Time validation
        const now = new Date();
        const elapsedSeconds = (now.getTime() - session.currentQuestionStartTime.getTime()) / 1000;
        if (elapsedSeconds > session.evaluation.timePerQuestion + 2) { // 2s grace for network
            throw new Error('Time limit exceeded');
        }
        // Find option and check correctness
        const selectedOption = question.options.find((opt) => opt.id === optionId);
        if (!selectedOption) {
            throw new Error('Invalid option selected');
        }
        // Save answer
        await prisma_1.default.userAnswer.create({
            data: {
                sessionId,
                questionId: question.id,
                optionId,
                isCorrect: selectedOption.isCorrect,
                startTime: session.currentQuestionStartTime,
                submittedAt: now
            }
        });
        // Move to next question
        const nextIndex = session.currentQuestionIndex + 1;
        const isLastQuestion = nextIndex >= session.evaluation.numQuestions || nextIndex >= session.evaluation.questions.length;
        if (isLastQuestion) {
            return await this.completeSession(sessionId);
        }
        else {
            await prisma_1.default.evaluationSession.update({
                where: { id: sessionId },
                data: {
                    currentQuestionIndex: nextIndex,
                    currentQuestionStartTime: null // Reset for next question
                }
            });
            return { message: 'Answer submitted, proceed to next question' };
        }
    }
    async completeSession(sessionId) {
        const answers = await prisma_1.default.userAnswer.findMany({
            where: { sessionId }
        });
        const correctCount = answers.filter((a) => a.isCorrect).length;
        const total = answers.length;
        const session = await prisma_1.default.evaluationSession.update({
            where: { id: sessionId },
            data: {
                status: 'COMPLETED',
                correctAnswersCount: correctCount,
                totalQuestions: total,
                score: total > 0 ? Math.round((correctCount / total) * 100) : 0,
                currentQuestionStartTime: null
            }
        });
        return {
            message: 'Evaluation completed',
            result: {
                score: session.score,
                totalQuestions: session.totalQuestions,
                correctAnswersCount: session.correctAnswersCount
            }
        };
    }
    async getResult(sessionId, userId) {
        const session = await prisma_1.default.evaluationSession.findUnique({
            where: { id: sessionId },
        });
        if (!session || session.userId !== userId) {
            throw new Error('Session not found');
        }
        if (session.status !== 'COMPLETED') {
            throw new Error('Session is not completed yet');
        }
        return {
            score: session.score,
            totalQuestions: session.totalQuestions,
            correctAnswersCount: session.correctAnswersCount
        };
    }
}
exports.SessionService = SessionService;
