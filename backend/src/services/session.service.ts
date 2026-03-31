import prisma from '../config/prisma';

export async function startSession(userId: string, evaluationId: string) {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id: evaluationId },
    include: { questions: true },
  });

  if (!evaluation) throw new Error('Évaluation introuvable.');
  if (evaluation.questions.length === 0) throw new Error('Aucune question dans cette évaluation.');

  const session = await prisma.evaluationSession.create({
    data: {
      userId,
      evaluationId,
      status: 'IN_PROGRESS',
      currentQuestionIndex: 0,
      totalQuestions: evaluation.questions.length,
    },
  });

  return session;
}

export async function getCurrentQuestion(sessionId: string) {
  const session = await prisma.evaluationSession.findUnique({
    where: { id: sessionId },
    include: {
      evaluation: {
        include: {
          questions: {
            include: { options: true },
            orderBy: { id: 'asc' },
          },
        },
      },
    },
  });

  if (!session) throw new Error('Session introuvable.');
  if (session.status === 'COMPLETED') {
    return { status: 'COMPLETED', session };
  }

  const questions = session.evaluation.questions;
  const totalQuestions = questions.length;
  const index = session.currentQuestionIndex;

  if (index >= totalQuestions) {
    // Should not happen, but handle it gracefully
    await prisma.evaluationSession.update({
      where: { id: sessionId },
      data: { status: 'COMPLETED' },
    });
    return { status: 'COMPLETED', session };
  }

  const question = questions[index];

  // Record start time if first time loading this question
  if (!session.currentQuestionStartTime) {
    await prisma.evaluationSession.update({
      where: { id: sessionId },
      data: { currentQuestionStartTime: new Date() },
    });
  }

  // Filter out isCorrect from options (anti-cheat)
  const safeOptions = question.options.map(({ id, text }) => ({ id, text }));

  return {
    status: 'IN_PROGRESS',
    currentQuestionIndex: index,
    totalQuestions,
    timeRemaining: session.evaluation.timePerQuestion,
    evaluation: { timePerQuestion: session.evaluation.timePerQuestion },
    question: {
      id: question.id,
      text: question.text,
      options: safeOptions,
    },
  };
}

export async function submitAnswer(sessionId: string, optionId: string | null) {
  const session = await prisma.evaluationSession.findUnique({
    where: { id: sessionId },
    include: {
      evaluation: {
        include: {
          questions: {
            include: { options: true },
            orderBy: { id: 'asc' },
          },
        },
      },
    },
  });

  if (!session) throw new Error('Session introuvable.');
  if (session.status === 'COMPLETED') throw new Error('La session est déjà terminée.');

  const questions = session.evaluation.questions;
  const totalQuestions = questions.length;
  const index = session.currentQuestionIndex;
  const question = questions[index];

  let isCorrect = false;
  const now = new Date();

  // Time validation (grace period: +2 seconds)
  const timeLimit = (session.evaluation.timePerQuestion + 2) * 1000; // ms
  if (session.currentQuestionStartTime) {
    const elapsed = now.getTime() - new Date(session.currentQuestionStartTime).getTime();
    if (elapsed > timeLimit) {
      // Time expired — mark as incorrect, skip
      optionId = null;
    }
  }

  // Determine correctness
  if (optionId) {
    const chosenOption = question.options.find(o => o.id === optionId);
    isCorrect = chosenOption?.isCorrect ?? false;
  }

  // Record the answer
  if (optionId) {
    await prisma.userAnswer.create({
      data: {
        sessionId,
        questionId: question.id,
        optionId,
        isCorrect,
        startTime: session.currentQuestionStartTime || now,
        submittedAt: now,
      },
    });
  }

  const nextIndex = index + 1;

  if (nextIndex >= totalQuestions) {
    // Session complete — calculate score
    const allAnswers = await prisma.userAnswer.findMany({ where: { sessionId } });
    const correctCount = allAnswers.filter(a => a.isCorrect).length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    await prisma.evaluationSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        currentQuestionIndex: nextIndex,
        score,
        correctAnswersCount: correctCount,
        totalQuestions,
        currentQuestionStartTime: null,
      },
    });

    return { status: 'COMPLETED', isCorrect, score };
  }

  // Move to next question
  await prisma.evaluationSession.update({
    where: { id: sessionId },
    data: {
      currentQuestionIndex: nextIndex,
      currentQuestionStartTime: null, // Will be set when next question is loaded
    },
  });

  return { status: 'IN_PROGRESS', isCorrect };
}

export async function getSessionResult(sessionId: string) {
  const session = await prisma.evaluationSession.findUnique({
    where: { id: sessionId },
    include: { evaluation: { select: { title: true } } },
  });

  if (!session) throw new Error('Session introuvable.');
  if (session.status !== 'COMPLETED') throw new Error('La session n\'est pas encore terminée.');

  return {
    sessionId: session.id,
    evaluationTitle: session.evaluation.title,
    score: session.score ?? 0,
    totalQuestions: session.totalQuestions ?? 0,
    correctAnswersCount: session.correctAnswersCount ?? 0,
    status: session.status,
  };
}
