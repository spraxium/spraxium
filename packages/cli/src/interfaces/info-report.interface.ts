import type { EnvInfo } from './env-info.interface';

export interface InfoReport {
  cliVersion: string;
  projectName: string;
  env: EnvInfo;
  frameworkVersions: Record<string, string>;
}
