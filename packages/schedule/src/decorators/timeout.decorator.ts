import type { TimeoutOptions } from '../interfaces/timeout-options.interface';
import { JobDefinitionFactory } from '../metadata/job-definition.factory';

export function Timeout(ms: number, options: TimeoutOptions = {}): MethodDecorator {
  return JobDefinitionFactory.create({ ...options, ms, type: 'timeout' });
}
