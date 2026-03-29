import prisma from '../config/prisma';
import { CreateEvaluationDto } from '../dtos/evaluation.dto';
import { generateAccessCode } from '../utils/code';

export class EvaluationService {
  async createEvaluation(userId: string, data: CreateEvaluationDto) {
    const evaluation = await prisma.evaluation.create({
      data: {
        ...data,
        creatorId: userId,
        accessCode: data.visibility === 'SHARED' ? generateAccessCode() : null,
        processingStatus: data.mode === 'AI' ? 'pending' : null,
      },
    });

    return evaluation;
  }

  async getUserEvaluations(userId: string) {
    return await prisma.evaluation.findMany({
      where: { creatorId: userId },
      include: {
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEvaluation(id: string) {
    const evaluation = await prisma.evaluation.findUnique({
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

  async generateCode(id: string, userId: string) {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
    });

    if (!evaluation) {
      throw new Error('Evaluation not found');
    }

    if (evaluation.creatorId !== userId) {
      throw new Error('Only the creator can generate an access code');
    }

    const updated = await prisma.evaluation.update({
      where: { id },
      data: {
        accessCode: generateAccessCode(),
        visibility: 'SHARED',
      },
    });

    return { accessCode: updated.accessCode };
  }

  async joinEvaluation(userId: string, accessCode: string) {
    const evaluation = await prisma.evaluation.findUnique({
      where: { accessCode },
    });

    if (!evaluation) {
      throw new Error('Invalid access code');
    }

    // In this platform, joining usually means being able to start a session.
    // We could return the evaluation details so the frontend can then call /sessions/start
    return evaluation;
  }
}
