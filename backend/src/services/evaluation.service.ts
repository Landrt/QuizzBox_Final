import prisma from '../config/prisma';

function randomCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function createEvaluation(userId: string, data: {
  title: string;
  description?: string;
  numQuestions: number;
  timePerQuestion: number;
  mode: string;
  visibility?: string;
}) {
  return prisma.evaluation.create({
    data: {
      title: data.title,
      description: data.description || null,
      numQuestions: data.numQuestions,
      timePerQuestion: data.timePerQuestion,
      mode: data.mode,
      visibility: data.visibility || 'PRIVATE',
      creatorId: userId,
    },
  });
}

export async function getUserEvaluations(userId: string) {
  return prisma.evaluation.findMany({
    where: { creatorId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { questions: true } },
    },
  });
}

export async function getEvaluationById(evaluationId: string) {
  return prisma.evaluation.findUnique({
    where: { id: evaluationId },
    include: {
      _count: { select: { questions: true } },
    },
  });
}

export async function generateAccessCode(evaluationId: string, userId: string) {
  const evaluation = await prisma.evaluation.findUnique({ where: { id: evaluationId } });
  if (!evaluation) throw new Error('Évaluation introuvable.');
  if (evaluation.creatorId !== userId) throw new Error('Non autorisé.');

  let code: string;
  let exists = true;
  // Ensure unique code
  do {
    code = randomCode(6);
    const taken = await prisma.evaluation.findUnique({ where: { accessCode: code } });
    exists = !!taken;
  } while (exists);

  const updated = await prisma.evaluation.update({
    where: { id: evaluationId },
    data: { accessCode: code, visibility: 'SHARED' },
  });

  return { accessCode: updated.accessCode };
}

export async function joinEvaluation(accessCode: string) {
  const clean = accessCode.replace(/-/g, '').toUpperCase();
  const evaluation = await prisma.evaluation.findUnique({ where: { accessCode: clean } });
  if (!evaluation) throw new Error('Code d\'accès invalide ou évaluation introuvable.');
  return evaluation;
}

export async function deleteEvaluation(evaluationId: string, userId: string) {
  const evaluation = await prisma.evaluation.findUnique({ where: { id: evaluationId } });
  if (!evaluation) throw new Error('Évaluation introuvable.');
  if (evaluation.creatorId !== userId) throw new Error('Non autorisé.');

  // Delete sessions and their user answers first to avoid FK constraint violations
  const sessions = await prisma.evaluationSession.findMany({ where: { evaluationId } });
  for (const session of sessions) {
    await prisma.userAnswer.deleteMany({ where: { sessionId: session.id } });
  }
  await prisma.evaluationSession.deleteMany({ where: { evaluationId } });

  return prisma.evaluation.delete({ where: { id: evaluationId } });
}

export async function createQuestion(evaluationId: string, data: {
  text: string;
  options: { text: string; isCorrect: boolean }[];
}) {
  return prisma.question.create({
    data: {
      text: data.text,
      evaluationId,
      options: {
        create: data.options.map(o => ({ text: o.text, isCorrect: o.isCorrect })),
      },
    },
    include: { options: true },
  });
}

export async function getQuestions(evaluationId: string) {
  return prisma.question.findMany({
    where: { evaluationId },
    include: { options: true },
  });
}
