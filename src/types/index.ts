export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: Date;
}

export interface Evaluation {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  isPublic: boolean;
  accessCode?: string;
  timePerQuestion: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  evaluationId: string;
  text: string;
  answers: Answer[];
  createdAt: Date;
}

export interface Answer {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
}

export interface Session {
  id: string;
  evaluationId: string;
  participantName: string;
  score: number;
  status: 'pending' | 'active' | 'completed';
  startedAt: Date;
  completedAt?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}
