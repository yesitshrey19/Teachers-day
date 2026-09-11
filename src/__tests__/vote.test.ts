import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  isValidFacultyName,
  isValidQuestionIndex,
  isDuoQuestion,
  validateVoteSubmission,
} from '@/lib/utils';
import { VoteAnswer, DuoVoteAnswer } from '@/lib/types';
import { FACULTY, TOTAL_QUESTIONS, DUO_QUESTION_INDEX } from '@/lib/constants';

describe('Vote Submission Validation', () => {
  it('accepts a valid vote for a standard question', () => {
    const answers: VoteAnswer[] = [
      { questionIndex: 0, answer: 'Dr. Ramaraju', isOther: false },
    ];
    const result = validateVoteSubmission(answers);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('accepts a skipped (null) answer', () => {
    const answers: VoteAnswer[] = [
      { questionIndex: 0, answer: null, isOther: false },
    ];
    const result = validateVoteSubmission(answers);
    expect(result.valid).toBe(true);
  });

  it('accepts an "other" answer with custom text', () => {
    const answers: VoteAnswer[] = [
      { questionIndex: 3, answer: 'Some custom answer', isOther: true },
    ];
    const result = validateVoteSubmission(answers);
    expect(result.valid).toBe(true);
  });

  it('rejects an invalid faculty name for a non-other answer', () => {
    const answers: VoteAnswer[] = [
      { questionIndex: 0, answer: 'Fake Professor', isOther: false },
    ];
    const result = validateVoteSubmission(answers);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects a negative question index', () => {
    const answers: VoteAnswer[] = [
      { questionIndex: -1, answer: 'Dr. Ramaraju', isOther: false },
    ];
    const result = validateVoteSubmission(answers);
    expect(result.valid).toBe(false);
  });

  it('rejects a question index beyond the max', () => {
    const answers: VoteAnswer[] = [
      { questionIndex: TOTAL_QUESTIONS, answer: 'Dr. Ramaraju', isOther: false },
    ];
    const result = validateVoteSubmission(answers);
    expect(result.valid).toBe(false);
  });

  it('rejects duplicate question indices', () => {
    const answers: VoteAnswer[] = [
      { questionIndex: 5, answer: 'Dr. Ramaraju', isOther: false },
      { questionIndex: 5, answer: 'Dr. Neethu', isOther: false },
    ];
    const result = validateVoteSubmission(answers);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Duplicate answer for question 5');
  });

  it('accepts a valid duo question answer', () => {
    const answers: DuoVoteAnswer[] = [
      {
        questionIndex: DUO_QUESTION_INDEX as 37,
        faculty1: 'Dr. Ramaraju',
        faculty2: 'Dr. Neethu',
        isOther: false,
      },
    ];
    const result = validateVoteSubmission(answers);
    expect(result.valid).toBe(true);
  });

  it('rejects a duo question with invalid faculty names', () => {
    const answers: DuoVoteAnswer[] = [
      {
        questionIndex: DUO_QUESTION_INDEX as 37,
        faculty1: 'Dr. Nobody',
        faculty2: 'Dr. Ramaraju',
        isOther: false,
      },
    ];
    const result = validateVoteSubmission(answers);
    expect(result.valid).toBe(false);
  });

  it('accepts a duo question with "other" flag even with custom names', () => {
    const answers: DuoVoteAnswer[] = [
      {
        questionIndex: DUO_QUESTION_INDEX as 37,
        faculty1: 'Custom Person 1',
        faculty2: 'Custom Person 2',
        isOther: true,
      },
    ];
    const result = validateVoteSubmission(answers);
    expect(result.valid).toBe(true);
  });

  it('validates a mixed submission of standard and duo answers', () => {
    const answers: (VoteAnswer | DuoVoteAnswer)[] = [
      { questionIndex: 0, answer: 'Dr. Ramaraju', isOther: false },
      { questionIndex: 1, answer: null, isOther: false },
      { questionIndex: 2, answer: 'Funny answer', isOther: true },
      {
        questionIndex: DUO_QUESTION_INDEX as 37,
        faculty1: 'Dr. Ramaraju',
        faculty2: 'Dr. Neethu',
        isOther: false,
      },
    ];
    const result = validateVoteSubmission(answers);
    expect(result.valid).toBe(true);
  });

  it('rejects non-array input', () => {
    const result = validateVoteSubmission('not an array' as any);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Answers must be an array');
  });
});

describe('Input Sanitization', () => {
  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('removes control characters', () => {
    expect(sanitizeInput('hello\x00world')).toBe('helloworld');
  });

  it('truncates to 200 characters', () => {
    const longInput = 'a'.repeat(300);
    expect(sanitizeInput(longInput)).toHaveLength(200);
  });

  it('handles empty input', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('handles null-ish input', () => {
    expect(sanitizeInput(undefined as any)).toBe('');
    expect(sanitizeInput(null as any)).toBe('');
  });
});

describe('Faculty Name Validation', () => {
  it('accepts all valid faculty names', () => {
    for (const name of FACULTY) {
      expect(isValidFacultyName(name)).toBe(true);
    }
  });

  it('rejects invalid names', () => {
    expect(isValidFacultyName('Dr. Nonexistent')).toBe(false);
    expect(isValidFacultyName('')).toBe(false);
    expect(isValidFacultyName('random')).toBe(false);
  });
});

describe('Question Index Validation', () => {
  it('accepts valid indices', () => {
    expect(isValidQuestionIndex(0)).toBe(true);
    expect(isValidQuestionIndex(20)).toBe(true);
    expect(isValidQuestionIndex(TOTAL_QUESTIONS - 1)).toBe(true);
  });

  it('rejects invalid indices', () => {
    expect(isValidQuestionIndex(-1)).toBe(false);
    expect(isValidQuestionIndex(TOTAL_QUESTIONS)).toBe(false);
    expect(isValidQuestionIndex(1.5)).toBe(false);
    expect(isValidQuestionIndex(NaN)).toBe(false);
  });
});

describe('Duo Question Detection', () => {
  it('identifies the duo question', () => {
    expect(isDuoQuestion(DUO_QUESTION_INDEX)).toBe(true);
  });

  it('rejects non-duo indices', () => {
    expect(isDuoQuestion(0)).toBe(false);
    expect(isDuoQuestion(36)).toBe(false);
    expect(isDuoQuestion(38)).toBe(false);
  });
});
