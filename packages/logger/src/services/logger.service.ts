import type { LogColorInput, LogEntry, LogFn, LogTransport, SpraxiumLoggerConfig } from '../interfaces';
import { ConsoleTransport, nativeLog } from '../transports/console.transport';
import { DiscordTransport } from '../transports/discord.transport';
import { isClientAwareTransport } from '../utils';
import { TokenMasker } from '../utils/token-masker.util';

export class Logger {
  private static transports: Array<LogTransport> = [new ConsoleTransport()];
  private static readonly masker = new TokenMasker();
  private static readonly levelColors = new Map<string, LogColorInput>();
  private static debugEnabled = false;

  constructor(private readonly context?: string) {}

  /** Configure transports, masking, and custom log levels. */
  static configure(config: SpraxiumLoggerConfig): void {
    for (const level of config.levels ?? []) {
      Logger.levelColors.set(level.name.toUpperCase(), level.color);
      ConsoleTransport.registerColor(level.name, level.color);
    }

    Logger.masker.configure(config.maskTokens ?? true);

    if (config.timestampFormat !== undefined) {
      ConsoleTransport.setTimestampFormat(config.timestampFormat);
    }

    Logger.removeTransport('discord');
    if (config.discord) {
      Logger.addTransport(new DiscordTransport(config.discord));
    }
  }

  /** Enable or disable debug-level output. Also honoured via `SPRAXIUM_DEBUG=true`. */
  static setDebug(enabled: boolean): void {
    Logger.debugEnabled = enabled;
  }

  /** Forward the Discord.js client to any `ClientAwareTransport` (e.g. `DiscordTransport`). */
  static setClient(client: unknown): void {
    for (const transport of Logger.transports) {
      if (isClientAwareTransport(transport)) {
        transport.setClient(client);
      }
    }
  }

  /** Add a transport. If a transport with the same name already exists it is replaced. */
  static addTransport(transport: LogTransport): void {
    Logger.removeTransport(transport.name);
    Logger.transports.push(transport);
  }

  static removeTransport(name: string): void {
    Logger.transports = Logger.transports.filter((t) => t.name !== name);
  }

  static getTransports(): Array<LogTransport> {
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

  /**
   * Only emits when `Logger.setDebug(true)` has been called or when the
   * environment variable `SPRAXIUM_DEBUG` is set to `'true'`.
   */
  debug(message: string): void {
    if (!Logger.debugEnabled && process.env.SPRAXIUM_DEBUG !== 'true') return;
    this.dispatch('debug', message);
  }

  /**
   * Emit on an arbitrary log level with optional structured metadata.
   *
   * Security: do NOT pass secrets as metadata values — they are forwarded to
   * all transports, including remote ones.
   */
  log(level: string, message: string, metadata?: Record<string, unknown>): void {
    this.dispatch(level, message, undefined, metadata);
  }

  /** Bypass all transports and write directly to the native console. */
  raw(message: string): void {
    nativeLog(message);
  }

  /**
   * Create a callable log function for a custom level.
   * Registers the color with the ConsoleTransport on first call.
   */
  extend(level: string, color?: LogColorInput): LogFn {
    const resolvedColor = color ?? Logger.levelColors.get(level.toUpperCase()) ?? 'gray';
    ConsoleTransport.registerColor(level, resolvedColor);

    return (message: string, contextOverride?: string): void => {
      this.dispatch(level, message, contextOverride);
    };
  }

  /** Derive a new logger with a fixed context label. */
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
          result.catch(() => {
            // Never let an async transport error crash the process.
          });
        }
      } catch {
        // Never let a sync transport error crash the process.
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

/** Convenience root-level logger instance (no context label). */
export const logger = new Logger();
