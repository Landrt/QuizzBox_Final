"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinEvaluationSchema = exports.CreateEvaluationSchema = void 0;
const zod_1 = require("zod");
exports.CreateEvaluationSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().optional(),
    numQuestions: zod_1.z.number().int().min(1),
    timePerQuestion: zod_1.z.number().int().min(5),
    mode: zod_1.z.enum(['AI', 'MANUAL']),
    visibility: zod_1.z.enum(['PRIVATE', 'SHARED']).optional(),
    pdfUrl: zod_1.z.string().url().optional(),
});
exports.JoinEvaluationSchema = zod_1.z.object({
    accessCode: zod_1.z.string().length(6),
});
