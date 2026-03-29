// Utilitaires génériques
export const generateAccessCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
};

export const calculateScore = (correct: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};
