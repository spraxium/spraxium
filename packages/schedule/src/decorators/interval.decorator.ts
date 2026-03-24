import 'reflect-metadata';
import { ConfigurationException } from '@spraxium/core';
import { MESSAGES } from '../constants/messages.constant';
import { SCHEDULE_METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { IntervalJobMetadata } from '../interfaces/interval-job-metadata.interface';
import type { IntervalOptions } from '../interfaces/interval-options.interface';

export function Interval(ms: number, options: IntervalOptions = {}): MethodDecorator {
  if (ms <= 0) {
    throw new ConfigurationException({
      key: 'intervalMs',
      reason: MESSAGES.INTERVAL_NEGATIVE_MS(ms),
    });
  }

  return (target, propertyKey, _descriptor) => {
    const meta: IntervalJobMetadata = { ms, ...options };
    Reflect.defineMetadata(SCHEDULE_METADATA_KEYS.INTERVAL, meta, target as object, propertyKey);
  };
}
