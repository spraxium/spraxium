import type { JobType } from '../types/job.type';

export interface JobStatus {
  name: string;
  type: JobType;
  expression?: string;
  intervalMs?: number;
  running: boolean;
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  description?: string;
}
