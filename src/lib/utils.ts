import { FACULTY, QUESTIONS, DUO_QUESTION_INDEX } from './constants';
import { VoteAnswer, DuoVoteAnswer } from './types';

export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    .substring(0, 200);
}

export function isValidFacultyName(name: string): boolean {
  return FACULTY.includes(name as any);
}

export function isValidQuestionIndex(index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < QUESTIONS.length;
}

export function isDuoQuestion(index: number): boolean {
  return index === DUO_QUESTION_INDEX;
}

export function calculatePercentage(count: number, total: number): number {
  if (total === 0) return 0;
  return Number(((count / total) * 100).toFixed(1));
}

export function generateSessionToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function validateVoteSubmission(answers: (VoteAnswer | DuoVoteAnswer)[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(answers)) {
    return { valid: false, errors: ['Answers must be an array'] };
  }

  // Track seen questions to prevent duplicates
  const seenQuestions = new Set<number>();

  for (const answerObj of answers) {
    if (!isValidQuestionIndex(answerObj.questionIndex)) {
      errors.push(`Invalid question index: ${answerObj.questionIndex}`);
      continue;
    }

    if (seenQuestions.has(answerObj.questionIndex)) {
      errors.push(`Duplicate answer for question ${answerObj.questionIndex}`);
      continue;
    }
    seenQuestions.add(answerObj.questionIndex);

    if (isDuoQuestion(answerObj.questionIndex)) {
      const duoAnswer = answerObj as DuoVoteAnswer;
      if (!duoAnswer.isOther) {
         if (!isValidFacultyName(duoAnswer.faculty1) || !isValidFacultyName(duoAnswer.faculty2)) {
            errors.push(`Invalid faculty names for duo question`);
         }
      }
    } else {
      const standardAnswer = answerObj as VoteAnswer;
      if (standardAnswer.answer !== null && !standardAnswer.isOther) {
        if (!isValidFacultyName(standardAnswer.answer)) {
           errors.push(`Invalid faculty name for question ${standardAnswer.questionIndex}: ${standardAnswer.answer}`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export class RateLimiter {
  private attempts: Map<string, { count: number; resetAt: number }>;

  constructor(private maxAttempts: number, private windowMs: number) {
    this.attempts = new Map();
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || record.resetAt <= now) {
      this.attempts.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}
