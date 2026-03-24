import 'reflect-metadata';
import { ConfigurationException } from '@spraxium/core';
import { MESSAGES } from '../constants/messages.constant';
import { SCHEDULE_METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { AfterBootJobMetadata } from '../interfaces/after-boot-job-metadata.interface';
import type { AfterBootOptions } from '../interfaces/after-boot-options.interface';

export function AfterBoot(ms: number, options: AfterBootOptions = {}): MethodDecorator {
  if (ms < 0) {
    throw new ConfigurationException({
      key: 'afterBootMs',
      reason: MESSAGES.AFTER_BOOT_NEGATIVE_MS(ms),
    });
  }

  return (target, propertyKey, _descriptor) => {
    const meta: AfterBootJobMetadata = { ms, ...options };
    Reflect.defineMetadata(SCHEDULE_METADATA_KEYS.AFTER_BOOT, meta, target as object, propertyKey);
  };
}
