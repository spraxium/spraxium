import { ConfigurationException } from '@spraxium/core';
import { CronExpressionParser } from 'cron-parser';
import { MESSAGES } from '../constants/messages.constant';

export function validateCronExpression(expression: string): void {
  try {
    CronExpressionParser.parse(expression);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new ConfigurationException({
      key: 'cronExpression',
      reason: MESSAGES.CRON_INVALID_EXPRESSION(expression, reason),
    });
  }
}

export function getNextRunDate(expression: string, timezone?: string): Date {
  return CronExpressionParser.parse(expression, { currentDate: new Date(), tz: timezone }).next().toDate();
}
