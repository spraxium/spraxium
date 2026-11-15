import type { IntervalOptions } from '../interfaces/interval-options.interface';
import { JobDefinitionFactory } from '../metadata/job-definition.factory';

export function Interval(ms: number, options: IntervalOptions = {}): MethodDecorator {
  return JobDefinitionFactory.create({ ...options, ms, type: 'interval' });
}
