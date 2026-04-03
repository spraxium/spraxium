import { describe, expect, it } from 'vitest';
import { getNextRunDate, validateCronExpression } from '../../src/utils/cron.parser';

describe('validateCronExpression', () => {
  it('accepts a valid 5-field expression', () => {
    expect(() => validateCronExpression('* * * * *')).not.toThrow();
  });

  it('accepts a valid 6-field expression with seconds', () => {
    expect(() => validateCronExpression('* * * * * *')).not.toThrow();
  });

  it('accepts a specific schedule expression', () => {
    expect(() => validateCronExpression('0 9 * * 1-5')).not.toThrow();
  });

  it('throws ConfigurationException for an invalid expression', () => {
    expect(() => validateCronExpression('invalid')).toThrow();
  });

  it('throws for an out-of-range value', () => {
    expect(() => validateCronExpression('99 * * * *')).toThrow();
  });
});

describe('getNextRunDate', () => {
  it('returns a Date in the future for a wildcard expression', () => {
    const next = getNextRunDate('* * * * *');
    expect(next).toBeInstanceOf(Date);
    expect(next.getTime()).toBeGreaterThan(Date.now());
  });

  it('returns a Date in the future for a 6-field expression', () => {
    const next = getNextRunDate('* * * * * *');
    expect(next).toBeInstanceOf(Date);
    expect(next.getTime()).toBeGreaterThan(Date.now());
  });

  it('returns a Date in the future for a specific hour', () => {
    const next = getNextRunDate('0 0 * * *');
    expect(next).toBeInstanceOf(Date);
    expect(next.getTime()).toBeGreaterThan(Date.now());
  });

  it('respects timezone option without throwing', () => {
    expect(() => getNextRunDate('0 9 * * *', 'America/New_York')).not.toThrow();
  });

  it('returns different results for different expressions', () => {
    const everyMinute = getNextRunDate('* * * * *');
    const everyHour = getNextRunDate('0 * * * *');
    expect(everyMinute.getTime()).not.toBe(everyHour.getTime());
  });
});
