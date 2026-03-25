import type { SpraxiumDevConfig } from './dev-config.interface';

export interface DevWatcherOptions {
  cwd: string;
  configReader: { readDevConfig(cwd: string): Promise<SpraxiumDevConfig> };
  initialConfig: SpraxiumDevConfig;
  onChange: (filePath: string) => void;
  onConfigUpdate?: (config: SpraxiumDevConfig) => void;
}
