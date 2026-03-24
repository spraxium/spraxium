import 'reflect-metadata';
import { ConfigurationException } from '@spraxium/core';
import { MESSAGES } from '../constants/messages.constant';
import { SCHEDULE_METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { TimeoutJobMetadata } from '../interfaces/timeout-job-metadata.interface';
import type { TimeoutOptions } from '../interfaces/timeout-options.interface';

export function Timeout(ms: number, options: TimeoutOptions = {}): MethodDecorator {
  if (ms < 0) {
    throw new ConfigurationException({
      key: 'timeoutMs',
      reason: MESSAGES.TIMEOUT_NEGATIVE_MS(ms),
    });
  }

  return (target, propertyKey, _descriptor) => {
    const meta: TimeoutJobMetadata = { ms, ...options };
    Reflect.defineMetadata(SCHEDULE_METADATA_KEYS.TIMEOUT, meta, target as object, propertyKey);
  };
}
