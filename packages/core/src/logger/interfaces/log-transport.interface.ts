import type { LogEntry } from './log-entry.interface';

export interface LogTransport {
  readonly name: string;
  log(entry: LogEntry): void | Promise<void>;
  close?(): void | Promise<void>;
}

export interface ClientAwareTransport extends LogTransport {
  setClient(client: unknown): void;
}
