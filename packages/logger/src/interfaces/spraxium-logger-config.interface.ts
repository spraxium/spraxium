import type { TimestampFormat } from '../utils';
import type { CustomLogLevel } from './custom-log-level.interface';
import type { DiscordTransportConfig } from './discord-transport-config.interface';

export interface SpraxiumLoggerConfig {
  /** Custom log levels to register alongside the built-in set. */
  levels?: Array<CustomLogLevel>;
  /**
   * Whether to scan log messages for Discord bot token patterns and replace
   * them with `[REDACTED]`. Defaults to `true`.
   */
  maskTokens?: boolean;
  /** When `true`, registers a listener that logs every slash command execution. */
  commandLogging?: boolean;
  /** Attach a Discord webhook or channel transport. */
  discord?: DiscordTransportConfig;
  /**
   * Controls how the timestamp prefix is rendered in console output.
   *
   * - `'default'`   - `DD/MM/YYYY - HH:MM:SS` (default)
   * - `'iso'`       - ISO 8601: `2026-05-02T14:30:00.000Z`
   * - `'time-only'` - `HH:MM:SS`
   * - `(d) => string` - custom formatter
   */
  timestampFormat?: TimestampFormat;
  /**
   * BCP 47 locale tag used when formatting the time portion of log timestamps.
   * Defaults to `'en-US'`. Example: `'pt-BR'` to produce `HH:MM:SS` in a
   * Brazilian Portuguese ICU table.
   */
  timestampLocale?: string;
}
