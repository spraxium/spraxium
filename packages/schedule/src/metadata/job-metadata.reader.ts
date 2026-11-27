import 'reflect-metadata';
import { ConfigurationException } from '@spraxium/core';
import type { ScheduledMethod } from '../interfaces/scheduled-method.interface';
import type { JobMetadata } from '../types/job-metadata.type';
import type { JobType } from '../types/job.type';
import { ScheduleValidator } from '../validation/schedule.validator';
import { JobDefinitionFactory } from './job-definition.factory';

export class JobMetadataReader {
  read(target: object): Array<ScheduledMethod> {
    const methods: Array<ScheduledMethod> = [];
    const visited = new Set<string | symbol>();
    let prototype: object | null = typeof target === 'function' ? target.prototype : target;
    while (prototype && prototype !== Object.prototype) {
      for (const name of Reflect.ownKeys(prototype)) {
        if (name === 'constructor' || visited.has(name)) continue;
        const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
        if (!descriptor || typeof descriptor.value !== 'function') {
          visited.add(name);
          continue;
        }
        const metadata = this.readMethod(prototype, name);
        if (!metadata && prototype === target && typeof target !== 'function') continue;
        visited.add(name);
        if (metadata) methods.push({ methodName: name, metadata });
      }
      prototype = Object.getPrototypeOf(prototype);
    }
    return methods;
  }

  private readMethod(target: object, name: string | symbol): JobMetadata | undefined {
    let found: JobMetadata | undefined;
    const types: ReadonlyArray<JobType> = ['cron', 'interval', 'timeout', 'after-online', 'run-once'];
    for (const type of types) {
      const value: unknown = Reflect.getOwnMetadata(JobDefinitionFactory.key(type), target, name);
      if (value === undefined) continue;
      if (!value || typeof value !== 'object')
        throw new ConfigurationException({ key: 'schedule', reason: 'Invalid schedule metadata' });
      if (found)
        throw new ConfigurationException({
          key: 'schedule',
          reason: `Multiple schedule decorators on ${String(name)}`,
        });
      found = ScheduleValidator.parseMetadata(value, type);
      ScheduleValidator.metadata(found);
    }
    return found;
  }
}
