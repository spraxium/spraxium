import { ConfigurationException } from '@spraxium/core';
import cronParser, { type ParserOptions } from 'cron-parser';
import { MESSAGES } from '../constants/messages.constant';

type CronParserOptions = ParserOptions<false> & { hasSeconds?: boolean };

function hasSeconds(expression: string): boolean {
  return expression.trim().split(/\s+/).length > 5;
}

export function validateCronExpression(expression: string): void {
  try {
    const opts: CronParserOptions = hasSeconds(expression) ? { hasSeconds: true } : {};
    cronParser.parseExpression(expression, opts);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new ConfigurationException({
      key: 'cronExpression',
      reason: MESSAGES.CRON_INVALID_EXPRESSION(expression, reason),
    });
  }
}

export function getNextRunDate(expression: string, timezone?: string): Date {
  const options: CronParserOptions = { currentDate: new Date() };
  if (timezone) options.tz = timezone;
  if (hasSeconds(expression)) options.hasSeconds = true;
  return cronParser.parseExpression(expression, options).next().toDate();
}
