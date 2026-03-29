"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessCode = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateAccessCode = () => {
    return crypto_1.default.randomBytes(3).toString('hex').toUpperCase();
};
exports.generateAccessCode = generateAccessCode;
