export type QuizStatus = 'Draft' | 'Published' | 'Live' | 'Closed';

export interface Question {
  id: string;
  story?: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  marks: number;
}

export interface ClientQuestion {
  id: string;
  story?: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  marks: number;
}

export interface Student {
  id: string;
  fullName: string;
  email: string;
  studentId: string;
  phone: string;
  registeredAt: string;
  quizStatus: 'Not Started' | 'In Progress' | 'Submitted';
  startTime?: string;
}

export interface Submission {
  id: string;
  studentId: string; // references Student.id
  studentName: string;
  studentEmail: string;
  studentCollegeId: string;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  score: number;
  totalMarks: number;
  percentage: number;
  timeTakenSeconds: number; // in seconds
  formattedTimeTaken: string; // e.g. "06:42"
  startTime: string;
  submittedAt: string;
}

export interface LeaderboardEntry extends Submission {
  rank: number;
}

export interface QuizConfig {
  title: string;
  subtitle: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  status: QuizStatus;
  requireStudentId: boolean;
  requirePhone: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}
