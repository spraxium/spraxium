import { describe, expect, it } from 'vitest';
import { CronExpression } from '../../src/enums/cron-expression.enum';
import { CronParser } from '../../src/utils/cron.parser';

describe('Cron calendar behavior', () => {
  it.each(Object.entries(CronExpression))(
    'accepts preset %s and produces a future date',
    (_name, expression) => {
      const current = new Date('2026-01-01T00:00:00Z');
      expect(CronParser.next(expression, 'UTC', current).getTime()).toBeGreaterThan(current.getTime());
    },
  );

  it.each([
    ['2026-01-27T12:00:00Z', '2026-01-31T00:00:00.000Z'],
    ['2026-02-01T00:00:00Z', '2026-02-28T00:00:00.000Z'],
    ['2028-02-01T00:00:00Z', '2028-02-29T00:00:00.000Z'],
    ['2026-04-01T00:00:00Z', '2026-04-30T00:00:00.000Z'],
    ['2026-12-31T00:00:00Z', '2027-01-31T00:00:00.000Z'],
  ])('schedules only the last day of the month after %s', (current, expected) => {
    expect(
      CronParser.next(CronExpression.EVERY_LAST_DAY_OF_MONTH, 'UTC', new Date(current)).toISOString(),
    ).toBe(expected);
  });

  it.each([
    ['2026-03-07T14:00:00Z', '2026-03-08T13:00:00.000Z'],
    ['2026-10-31T13:00:00Z', '2026-11-01T14:00:00.000Z'],
  ])('preserves local time across DST after %s', (current, expected) => {
    expect(CronParser.next('0 9 * * *', 'America/New_York', new Date(current)).toISOString()).toBe(expected);
  });
});
