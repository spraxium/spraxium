import type { JobType } from '../types/job.type';

export interface JobEntry {
  name: string;
  type: JobType;
  expression?: string;
  intervalMs?: number;
  runAt?: Date;
  timezone?: string;
  fn: () => Promise<void>;
  running: boolean;
  disabled: boolean;
  runOnInit: boolean;
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  intervalHandle?: ReturnType<typeof setInterval>;
  timeoutHandle?: ReturnType<typeof setTimeout>;
}
