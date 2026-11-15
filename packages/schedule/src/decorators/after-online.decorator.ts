import type { AfterOnlineOptions } from '../interfaces/after-online-options.interface';
import { JobDefinitionFactory } from '../metadata/job-definition.factory';

export function AfterOnline(ms: number, options: AfterOnlineOptions = {}): MethodDecorator {
  return JobDefinitionFactory.create({ ...options, ms, type: 'after-online' });
}
