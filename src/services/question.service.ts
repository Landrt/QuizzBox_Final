import prisma from '../config/prisma';
import { CreateQuestionDto } from '../dtos/question.dto';

export class QuestionService {
  async createQuestion(evaluationId: string, userId: string, data: CreateQuestionDto) {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: evaluationId },
    });

    if (!evaluation) {
      throw new Error('Evaluation not found');
    }

    if (evaluation.creatorId !== userId) {
      throw new Error('Only the creator can add questions');
    }

    const question = await prisma.question.create({
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

  async getQuestions(evaluationId: string) {
    const questions = await prisma.question.findMany({
      where: { evaluationId },
      include: {
        options: true,
      },
    });

    return questions;
  }
}
