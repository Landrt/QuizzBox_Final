"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Erreur serveur interne';
    const code = err.code || 'INTERNAL_ERROR';
    console.error(`[ERROR] ${code}: ${message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }
    res.status(statusCode).json({
        success: false,
        error: message,
        code,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
exports.errorHandler = errorHandler;
const createError = (message, statusCode, code) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code || `ERROR_${statusCode}`;
    return error;
};
exports.createError = createError;
