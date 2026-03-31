import prisma from '../config/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_secret';
const SALT_ROUNDS = 10;

function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export async function registerUser(data: { email: string; password: string; fullName: string }) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error('Un compte existe déjà avec cet email.');

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      fullName: data.fullName,
    },
    select: { id: true, email: true, fullName: true, createdAt: true },
  });

  const token = generateToken(user.id);
  return { user: { ...user, name: user.fullName }, token };
}

export async function loginUser(data: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new Error('Identifiants invalides.');

  const isValid = await bcrypt.compare(data.password, user.password);
  if (!isValid) throw new Error('Identifiants invalides.');

  const token = generateToken(user.id);
  return {
    user: { id: user.id, email: user.email, fullName: user.fullName, name: user.fullName },
    token,
  };
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, fullName: true, createdAt: true },
  });
  if (!user) throw new Error('Utilisateur introuvable.');
  return { ...user, name: user.fullName };
}
