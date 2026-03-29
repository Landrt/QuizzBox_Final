import { z } from 'zod';

export const StartSessionSchema = z.object({
  evaluationId: z.string().uuid(),
});

export const SubmitAnswerSchema = z.object({
  optionId: z.string().uuid(),
});

export type StartSessionDto = z.infer<typeof StartSessionSchema>;
export type SubmitAnswerDto = z.infer<typeof SubmitAnswerSchema>;
