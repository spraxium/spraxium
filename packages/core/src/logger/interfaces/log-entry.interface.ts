export interface LogEntry {
  level: string;
  message: string;
  context?: string;
  timestamp: Date;
  shard?: number;
  metadata?: Record<string, unknown>;
}
