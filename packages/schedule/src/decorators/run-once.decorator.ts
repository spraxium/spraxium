import type { RunOnceOptions } from '../interfaces/run-once-options.interface';
import { JobDefinitionFactory } from '../metadata/job-definition.factory';

export function RunOnce(date: Date, options: RunOnceOptions = {}): MethodDecorator {
  return JobDefinitionFactory.create({ ...options, date, type: 'run-once' });
}
