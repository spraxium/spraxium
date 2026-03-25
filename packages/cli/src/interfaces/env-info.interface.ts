export interface EnvInfo {
  os: string;
  node: string;
  runtime: string;
  cwd: string;
  packageManager: string;
  packageManagers: Record<string, string>;
}
