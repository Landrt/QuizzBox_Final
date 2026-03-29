"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const requestLogger = (req, _res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const ip = req.ip || 'unknown';
    console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
    next();
};
exports.requestLogger = requestLogger;
