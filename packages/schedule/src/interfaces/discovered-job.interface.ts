import type { JobType } from '../types/job.type';

export interface DiscoveredJob {
  methodName: string | symbol;
  type: JobType;
  expression?: string;
  intervalMs?: number;
  name?: string;
  disabled: boolean;
}
