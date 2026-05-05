import type { LogEntry } from './log-entry.interface';

/** A pluggable output destination for log entries. */
export interface LogTransport {
  /** Unique name used to identify and replace transports. */
  readonly name: string;
  /** Write a log entry. May return a Promise for async transports. */
  log(entry: LogEntry): void | Promise<void>;
  /** Optional teardown hook (e.g. flush pending async queue). */
  close?(): void | Promise<void>;
}

/** Extended transport interface for transports that need the Discord client. */
export interface ClientAwareTransport extends LogTransport {
  setClient(client: unknown): void;
}
