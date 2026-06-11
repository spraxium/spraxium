import type { EnvInfo } from './env-info.interface';

export interface InfoReport {
  projectName: string;
  env: EnvInfo;
  frameworkVersions: Record<string, string>;
}
