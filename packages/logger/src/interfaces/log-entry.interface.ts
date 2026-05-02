/** A single structured log record passed to every transport. */
export interface LogEntry {
  /** The log level string (e.g. `'info'`, `'error'`, `'command'`). */
  level: string;
  /** The already-masked message text. Never contains raw secrets. */
  message: string;
  /** Optional caller context label (e.g. class name or module name). */
  context?: string;
  timestamp: Date;
  /** Discord shard ID, when running in a sharded process. */
  shard?: number;
  /**
   * Arbitrary structured metadata.
   * Do NOT store secrets here — values are serialized and forwarded to all
   * transports, including remote ones.
   */
  metadata?: Record<string, unknown>;
}
