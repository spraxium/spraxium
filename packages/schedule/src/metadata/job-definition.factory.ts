import 'reflect-metadata';
import { ConfigurationException } from '@spraxium/core';
import { SCHEDULE_METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { JobMetadata } from '../types/job-metadata.type';
import { CronParser } from '../utils/cron.parser';
import { ScheduleValidator } from '../validation/schedule.validator';

export class JobDefinitionFactory {
  private constructor(private readonly metadata: JobMetadata) {}

  static create(metadata: JobMetadata): MethodDecorator {
    ScheduleValidator.metadata(metadata);
    if (metadata.type === 'cron') CronParser.validate(metadata.expression, metadata.timezone);
    const snapshot =
      metadata.type === 'run-once' ? { ...metadata, date: new Date(metadata.date) } : { ...metadata };
    const definition = new JobDefinitionFactory(snapshot);
    return definition.decorate.bind(definition);
  }

  static key(type: JobMetadata['type']): string {
    switch (type) {
      case 'cron':
        return SCHEDULE_METADATA_KEYS.CRON;
      case 'interval':
        return SCHEDULE_METADATA_KEYS.INTERVAL;
      case 'timeout':
        return SCHEDULE_METADATA_KEYS.TIMEOUT;
      case 'after-online':
        return SCHEDULE_METADATA_KEYS.AFTER_ONLINE;
      case 'run-once':
        return SCHEDULE_METADATA_KEYS.RUN_ONCE;
    }
  }

  private decorate(target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
    if (
      descriptor?.get ||
      descriptor?.set ||
      (descriptor?.value !== undefined && typeof descriptor.value !== 'function')
    ) {
      throw new ConfigurationException({
        key: 'schedule',
        reason: 'Schedule decorators require an instance method',
      });
    }
    if (typeof target === 'function')
      throw new ConfigurationException({
        key: 'schedule',
        reason: 'Static scheduled methods are not supported',
      });
    for (const key of Object.values(SCHEDULE_METADATA_KEYS)) {
      if (Reflect.hasOwnMetadata(key, target, propertyKey))
        throw new ConfigurationException({
          key: 'schedule',
          reason: `Multiple schedule decorators on ${String(propertyKey)}`,
        });
    }
    const { type, ...value } = this.metadata;
    Reflect.defineMetadata(JobDefinitionFactory.key(type), value, target, propertyKey);
  }
}
