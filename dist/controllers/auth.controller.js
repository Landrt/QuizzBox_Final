"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_dto_1 = require("../dtos/auth.dto");
const authService = new auth_service_1.AuthService();
class AuthController {
    async register(req, res) {
        try {
            const validatedData = auth_dto_1.RegisterSchema.parse(req.body);
            const result = await authService.register(validatedData);
            res.status(201).json(result);
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(400).json({ message: error.message });
        }
    }
    async login(req, res) {
        try {
            const validatedData = auth_dto_1.LoginSchema.parse(req.body);
            const result = await authService.login(validatedData);
            res.status(200).json(result);
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(401).json({ message: error.message });
        }
    }
    async profile(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const user = await authService.getProfile(userId);
            res.status(200).json(user);
        }
        catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
}
exports.AuthController = AuthController;
