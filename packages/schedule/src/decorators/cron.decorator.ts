import type { CronOptions } from '../interfaces/cron-options.interface';
import { JobDefinitionFactory } from '../metadata/job-definition.factory';

export function Cron(expression: string, options: CronOptions = {}): MethodDecorator {
  return JobDefinitionFactory.create({ ...options, expression, type: 'cron' });
}
