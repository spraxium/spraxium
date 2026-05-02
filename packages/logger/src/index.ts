export { Logger, logger } from './logger.service';
export { CommandLogger } from './command-logger.service';
export { ConsoleTransport, nativeLog, nativeWarn, nativeError } from './console.transport';
export { DiscordTransport } from './discord.transport';
export { TokenMasker } from './token-masker.util';
export { TableBuilder, TABLE_STYLE } from './table-builder.util';
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

// Constants (useful for consumers building custom transports)
export { ANSI, type AnsiColorName, CONSOLE_LEVEL_COLORS, DISCORD_LEVEL_COLORS } from './constants';
