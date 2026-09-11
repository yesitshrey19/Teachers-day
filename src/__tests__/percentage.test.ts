import { describe, it, expect } from 'vitest';
import { calculatePercentage } from '@/lib/utils';

describe('Percentage Calculations', () => {
  it('calculates a simple percentage', () => {
    expect(calculatePercentage(50, 100)).toBe(50.0);
  });

  it('calculates a percentage with one decimal place', () => {
    expect(calculatePercentage(1, 3)).toBeCloseTo(33.3, 1);
  });

  it('calculates 100% correctly', () => {
    expect(calculatePercentage(10, 10)).toBe(100.0);
  });

  it('calculates 0% correctly', () => {
    expect(calculatePercentage(0, 100)).toBe(0);
  });

  it('handles division by zero gracefully', () => {
    expect(calculatePercentage(0, 0)).toBe(0);
    expect(calculatePercentage(5, 0)).toBe(0);
  });

  it('handles small vote counts accurately', () => {
    expect(calculatePercentage(1, 1)).toBe(100.0);
    expect(calculatePercentage(1, 2)).toBe(50.0);
    expect(calculatePercentage(1, 7)).toBeCloseTo(14.3, 1);
  });

  it('handles larger vote counts', () => {
    expect(calculatePercentage(256, 1024)).toBe(25.0);
    expect(calculatePercentage(333, 1000)).toBe(33.3);
  });

  it('calculates proper percentages for a typical vote distribution', () => {
    const totalVotes = 45;
    const distribution = [
      { name: 'Dr. Ramaraju', count: 15 },
      { name: 'Dr. Neethu', count: 12 },
      { name: 'Prof. Spoorthy', count: 8 },
      { name: 'Dr. Gokulan', count: 5 },
      { name: 'Others', count: 5 },
    ];

    const percentages = distribution.map(d => ({
      ...d,
      percentage: calculatePercentage(d.count, totalVotes),
    }));

    expect(percentages[0].percentage).toBeCloseTo(33.3, 1);
    expect(percentages[1].percentage).toBeCloseTo(26.7, 1);
    expect(percentages[2].percentage).toBeCloseTo(17.8, 1);
    expect(percentages[3].percentage).toBeCloseTo(11.1, 1);
    expect(percentages[4].percentage).toBeCloseTo(11.1, 1);

    // Verify total is approximately 100% (may differ slightly due to rounding)
    const totalPercentage = percentages.reduce((sum, p) => sum + p.percentage, 0);
    expect(totalPercentage).toBeGreaterThan(99);
    expect(totalPercentage).toBeLessThan(101);
  });

  it('identifies the leading answer correctly in a distribution', () => {
    const results = [
      { answer: 'Dr. Ramaraju', count: 15, percentage: calculatePercentage(15, 45) },
      { answer: 'Dr. Neethu', count: 12, percentage: calculatePercentage(12, 45) },
      { answer: 'Prof. Spoorthy', count: 8, percentage: calculatePercentage(8, 45) },
    ];

    const leading = results.reduce((a, b) => (a.count > b.count ? a : b));
    expect(leading.answer).toBe('Dr. Ramaraju');
    expect(leading.percentage).toBeCloseTo(33.3, 1);
  });

  it('handles a tie scenario', () => {
    const p1 = calculatePercentage(10, 40);
    const p2 = calculatePercentage(10, 40);
    expect(p1).toBe(p2);
    expect(p1).toBe(25.0);
  });

  it('returns a number type, not a string', () => {
    const result = calculatePercentage(1, 3);
    expect(typeof result).toBe('number');
  });
});
