import 'reflect-metadata';
import { SCHEDULE_METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { CronJobMetadata } from '../interfaces/cron-job-metadata.interface';
import type { CronOptions } from '../interfaces/cron-options.interface';
import { validateCronExpression } from '../utils/cron.parser';

export function Cron(expression: string, options: CronOptions = {}): MethodDecorator {
  validateCronExpression(expression);

  return (target, propertyKey, _descriptor) => {
    const meta: CronJobMetadata = { expression, ...options };
    Reflect.defineMetadata(SCHEDULE_METADATA_KEYS.CRON, meta, target as object, propertyKey);
  };
}
