import type { CustomLogLevel } from './custom-log-level.interface';
import type { DiscordTransportConfig } from './discord-transport-config.interface';

export interface SpraxiumLoggerConfig {
  levels?: Array<CustomLogLevel>;
  maskTokens?: boolean;
  commandLogging?: boolean;
  discord?: DiscordTransportConfig;
}
