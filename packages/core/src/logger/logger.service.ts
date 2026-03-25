import { ConsoleTransport, nativeLog } from './console.transport';
import { DiscordTransport } from './discord.transport';
import type { LogColorInput, LogEntry, LogFn, LogTransport, SpraxiumLoggerConfig } from './interfaces';
import { TokenMasker } from './token-masker.util';
import { isClientAwareTransport } from './utils';

export class Logger {
  private static transports: Array<LogTransport> = [new ConsoleTransport()];
  private static readonly masker = new TokenMasker();
  private static readonly levelColors = new Map<string, LogColorInput>();
  private static debugEnabled = false;

  constructor(private readonly context?: string) {}

  static configure(config: SpraxiumLoggerConfig): void {
    for (const level of config.levels ?? []) {
      Logger.levelColors.set(level.name.toUpperCase(), level.color);
      ConsoleTransport.registerColor(level.name, level.color);
    }

    Logger.masker.configure(config.maskTokens ?? true);

    Logger.removeTransport('discord');
    if (config.discord) {
      Logger.addTransport(new DiscordTransport(config.discord));
    }
  }

  static setDebug(enabled: boolean): void {
    Logger.debugEnabled = enabled;
  }

  static setClient(client: unknown): void {
    for (const transport of Logger.transports) {
      if (isClientAwareTransport(transport)) {
        transport.setClient(client);
      }
    }
  }

  static addTransport(transport: LogTransport): void {
    Logger.removeTransport(transport.name);
    Logger.transports.push(transport);
  }

  static removeTransport(name: string): void {
    Logger.transports = Logger.transports.filter((t) => t.name !== name);
  }

  static getTransports(): readonly LogTransport[] {
    return Logger.transports;
  }

  info(message: string): void {
    this.dispatch('info', message);
  }

  success(message: string): void {
    this.dispatch('success', message);
  }

  warn(message: string): void {
    this.dispatch('warn', message);
  }

  error(message: string): void {
    this.dispatch('error', message);
  }

  debug(message: string): void {
    if (!Logger.debugEnabled && process.env.SPRAXIUM_DEBUG !== 'true') return;
    this.dispatch('debug', message);
  }

  log(level: string, message: string, metadata?: Record<string, unknown>): void {
    this.dispatch(level, message, undefined, metadata);
  }

  raw(message: string): void {
    nativeLog(message);
  }

  extend(level: string, color?: LogColorInput): LogFn {
    const resolvedColor = color ?? Logger.levelColors.get(level.toUpperCase()) ?? 'gray';
    ConsoleTransport.registerColor(level, resolvedColor);

    return (message: string, contextOverride?: string): void => {
      this.dispatch(level, message, contextOverride);
    };
  }

  child(name: string): Logger {
    return new Logger(name);
  }

  private dispatch(
    level: string,
    message: string,
    contextOverride?: string,
    metadata?: Record<string, unknown>,
  ): void {
    const masked = Logger.masker.mask(message);
    const entry: LogEntry = {
      level,
      message: masked,
      context: contextOverride ?? this.context,
      timestamp: new Date(),
      shard: Logger.resolveShard(),
      metadata,
    };

    for (const transport of Logger.transports) {
      try {
        const result = transport.log(entry);
        if (result instanceof Promise) {
          result.catch(() => {});
        }
      } catch {
        // Never let a transport error crash the application
      }
    }
  }

  private static resolveShard(): number | undefined {
    const raw = process.env.SHARDS;
    if (raw === undefined) return undefined;
    const id = Number(raw.split(',')[0]);
    return Number.isNaN(id) ? undefined : id;
  }
}

export const logger = new Logger();
