import type { AfterOnlineJobMetadata } from '../interfaces/after-online-job-metadata.interface';
import type { CronJobMetadata } from '../interfaces/cron-job-metadata.interface';
import type { IntervalJobMetadata } from '../interfaces/interval-job-metadata.interface';
import type { RunOnceJobMetadata } from '../interfaces/run-once-job-metadata.interface';
import type { TimeoutJobMetadata } from '../interfaces/timeout-job-metadata.interface';

export type JobMetadata =
  | (CronJobMetadata & { type: 'cron' })
  | (IntervalJobMetadata & { type: 'interval' })
  | (TimeoutJobMetadata & { type: 'timeout' })
  | (AfterOnlineJobMetadata & { type: 'after-online' })
  | (RunOnceJobMetadata & { type: 'run-once' });
