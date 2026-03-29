"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitAnswerSchema = exports.StartSessionSchema = void 0;
const zod_1 = require("zod");
exports.StartSessionSchema = zod_1.z.object({
    evaluationId: zod_1.z.string().uuid(),
});
exports.SubmitAnswerSchema = zod_1.z.object({
    optionId: zod_1.z.string().uuid(),
});
