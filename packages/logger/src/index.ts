export { Logger, logger, CommandLogger } from './services';
export { ConsoleTransport, nativeLog, nativeWarn, nativeError, DiscordTransport } from './transports';
export { TokenMasker, TableBuilder, TABLE_STYLE } from './utils';
export type { TimestampFormat } from './utils';
export type {
  BuiltInLogLevel,
  LogLevel,
  LogColor,
  LogColorInput,
  LogFn,
  LogEntry,
  LogTransport,
  ClientAwareTransport,
  CustomLogLevel,
  DiscordEmbedTemplate,
  DiscordTransportConfig,
  SendableChannel,
  SpraxiumLoggerConfig,
} from './interfaces';

export { ANSI, type AnsiColorName, CONSOLE_LEVEL_COLORS, DISCORD_LEVEL_COLORS } from './constants';
