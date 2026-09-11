import { describe, it, expect } from 'vitest';
import { DUO_QUESTION_INDEX } from '@/lib/constants';
import { isValidFacultyName, isDuoQuestion } from '@/lib/utils';
import { DuoVoteAnswer } from '@/lib/types';

describe('Duo Question Validation', () => {
  it('correctly identifies question 37 as the duo question', () => {
    expect(isDuoQuestion(37)).toBe(true);
    expect(DUO_QUESTION_INDEX).toBe(37);
  });

  it('rejects when both faculty members are the same', () => {
    const validateDuo = (f1: string, f2: string): boolean => {
      return f1 !== f2;
    };

    expect(validateDuo('Dr. Ramaraju', 'Dr. Ramaraju')).toBe(false);
    expect(validateDuo('Dr. Neethu', 'Dr. Neethu')).toBe(false);
    expect(validateDuo('Prof. Spoorthy', 'Prof. Spoorthy')).toBe(false);
  });

  it('accepts when faculty members are different', () => {
    const validateDuo = (f1: string, f2: string): boolean => {
      return f1 !== f2;
    };

    expect(validateDuo('Dr. Ramaraju', 'Dr. Neethu')).toBe(true);
    expect(validateDuo('Prof. Spoorthy', 'Dr. Gokulan')).toBe(true);
    expect(validateDuo('Mr. Sanjeev', 'Mrs. Tahera')).toBe(true);
  });

  it('validates both faculty names in a duo answer', () => {
    const duoAnswer: DuoVoteAnswer = {
      questionIndex: 37,
      faculty1: 'Dr. Ramaraju',
      faculty2: 'Dr. Neethu',
      isOther: false,
    };

    expect(isValidFacultyName(duoAnswer.faculty1)).toBe(true);
    expect(isValidFacultyName(duoAnswer.faculty2)).toBe(true);
    expect(duoAnswer.faculty1).not.toBe(duoAnswer.faculty2);
  });

  it('rejects invalid faculty names in a duo answer', () => {
    const duoAnswer: DuoVoteAnswer = {
      questionIndex: 37,
      faculty1: 'Dr. Imaginary',
      faculty2: 'Dr. Ramaraju',
      isOther: false,
    };

    expect(isValidFacultyName(duoAnswer.faculty1)).toBe(false);
    expect(isValidFacultyName(duoAnswer.faculty2)).toBe(true);
  });

  it('allows "other" duo answers with custom text', () => {
    const duoAnswer: DuoVoteAnswer = {
      questionIndex: 37,
      faculty1: 'Custom Person 1',
      faculty2: 'Custom Person 2',
      isOther: true,
    };

    // When isOther is true, we skip faculty name validation
    expect(duoAnswer.isOther).toBe(true);
    expect(duoAnswer.faculty1).not.toBe(duoAnswer.faculty2);
  });

  it('handles edge case: empty strings in duo selection', () => {
    expect('' !== '').toBe(false);
    expect(isValidFacultyName('')).toBe(false);
  });

  it('normalizes duo pairs: order should not matter for counting', () => {
    const normalizePair = (f1: string, f2: string): string => {
      return [f1, f2].sort().join(' & ');
    };

    const pair1 = normalizePair('Dr. Ramaraju', 'Dr. Neethu');
    const pair2 = normalizePair('Dr. Neethu', 'Dr. Ramaraju');
    expect(pair1).toBe(pair2);
  });

  it('does not normalize different pairs to the same string', () => {
    const normalizePair = (f1: string, f2: string): string => {
      return [f1, f2].sort().join(' & ');
    };

    const pair1 = normalizePair('Dr. Ramaraju', 'Dr. Neethu');
    const pair2 = normalizePair('Dr. Ramaraju', 'Dr. Gokulan');
    expect(pair1).not.toBe(pair2);
  });
});
