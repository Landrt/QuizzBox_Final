import crypto from 'crypto';

export const generateAccessCode = (): string => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};
