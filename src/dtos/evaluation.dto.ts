import { z } from 'zod';

export const CreateEvaluationSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  numQuestions: z.number().int().min(1),
  timePerQuestion: z.number().int().min(5),
  mode: z.enum(['AI', 'MANUAL']),
  visibility: z.enum(['PRIVATE', 'SHARED']).optional(),
  pdfUrl: z.string().url().optional(),
});

export const JoinEvaluationSchema = z.object({
  accessCode: z.string().length(6),
});

export type CreateEvaluationDto = z.infer<typeof CreateEvaluationSchema>;
export type JoinEvaluationDto = z.infer<typeof JoinEvaluationSchema>;
