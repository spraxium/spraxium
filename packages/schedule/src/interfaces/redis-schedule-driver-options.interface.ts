export interface RedisScheduleDriverOptions {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  db?: number;
  keyPrefix?: string;
  tls?: boolean;
  connectTimeout?: number;
  maxRetriesPerRequest?: number | null;
  family?: 4 | 6;
}
