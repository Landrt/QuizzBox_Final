"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateScore = exports.sanitizeString = exports.validateEmail = exports.generateAccessCode = void 0;
// Utilitaires génériques
const generateAccessCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};
exports.generateAccessCode = generateAccessCode;
const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};
exports.validateEmail = validateEmail;
const sanitizeString = (str) => {
    return str.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
};
exports.sanitizeString = sanitizeString;
const calculateScore = (correct, total) => {
    if (total === 0)
        return 0;
    return Math.round((correct / total) * 100);
};
exports.calculateScore = calculateScore;
