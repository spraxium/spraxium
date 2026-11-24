import type { JobMetadata } from '../types/job-metadata.type';

export interface ScheduledMethod {
  methodName: string | symbol;
  metadata: JobMetadata;
}
