import type { EnvInfoInterface } from './env-info.interface';

export interface InfoReportInterface {
  cliVersion: string;
  projectName: string;
  env: EnvInfoInterface;
  frameworkVersions: Record<string, string>;
}
