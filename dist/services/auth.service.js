"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../config/prisma"));
const jwt_1 = require("../utils/jwt");
class AuthService {
    async register(data) {
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new Error('User already exists');
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                fullName: data.fullName,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                createdAt: true,
            },
        });
        const token = (0, jwt_1.generateToken)(user.id);
        return { user, token };
    }
    async login(data) {
        const user = await prisma_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        const token = (0, jwt_1.generateToken)(user.id);
        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
            },
            token,
        };
    }
    async getProfile(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}
exports.AuthService = AuthService;
