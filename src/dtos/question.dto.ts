import { z } from 'zod';

export const AnswerOptionSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

export const CreateQuestionSchema = z.object({
  text: z.string().min(5),
  options: z.array(AnswerOptionSchema).min(2),
});

export type CreateQuestionDto = z.infer<typeof CreateQuestionSchema>;
export type AnswerOptionDto = z.infer<typeof AnswerOptionSchema>;
