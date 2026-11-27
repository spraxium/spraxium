import { ConfigurationException } from '@spraxium/core';
import { CronExpressionParser } from 'cron-parser';
import { MESSAGES } from '../constants/messages.constant';
import { ScheduleValidator } from '../validation/schedule.validator';

export class CronParser {
  static validate(expression: string, timezone?: string): void {
    CronParser.next(expression, timezone);
  }

  static next(expression: string, timezone?: string, currentDate = new Date()): Date {
    ScheduleValidator.timezone(timezone);
    try {
      if (typeof expression !== 'string' || expression.trim().length === 0)
        throw new Error('Expression must not be empty');
      return CronExpressionParser.parse(expression, { currentDate, tz: timezone }).next().toDate();
    } catch (error) {
      throw new ConfigurationException({
        key: 'cronExpression',
        reason: MESSAGES.CRON_INVALID_EXPRESSION(
          expression,
          error instanceof Error ? error.message : String(error),
        ),
      });
    }
  }
}

export function validateCronExpression(expression: string): void {
  CronParser.validate(expression);
}

export function getNextRunDate(expression: string, timezone?: string): Date {
  return CronParser.next(expression, timezone);
}
