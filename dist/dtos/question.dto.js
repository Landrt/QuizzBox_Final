"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateQuestionSchema = exports.AnswerOptionSchema = void 0;
const zod_1 = require("zod");
exports.AnswerOptionSchema = zod_1.z.object({
    text: zod_1.z.string().min(1),
    isCorrect: zod_1.z.boolean(),
});
exports.CreateQuestionSchema = zod_1.z.object({
    text: zod_1.z.string().min(5),
    options: zod_1.z.array(exports.AnswerOptionSchema).min(2),
});
