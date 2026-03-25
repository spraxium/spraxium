import type { SpraxiumDevConfigInterface } from './dev-config.interface';

export interface DevWatcherOptionsInterface {
  cwd: string;
  configReader: { readDevConfig(cwd: string): Promise<SpraxiumDevConfigInterface> };
  initialConfig: SpraxiumDevConfigInterface;
  onChange: (filePath: string) => void;
  onConfigUpdate?: (config: SpraxiumDevConfigInterface) => void;
}
