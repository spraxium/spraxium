import type { Constructor } from '../types';
import type { RateLimitConfig } from './rate-limit-config.interface';
import type { SecurityConfig } from './security-config.interface';

/**
 * Configures the per-request access log emitted by `LoggerMiddleware`.
 *
 * - `true` / omit - default behaviour (info on success, warn on 4xx/5xx)
 * - `false` - disable all request logging
 * - object - override the log level used for successful or error responses
 */
export type AccessLogConfig =
  | boolean
  | {
      /** Level used for 2xx/3xx responses. `'off'` silences them. Defaults to `'info'`. */
      successLevel?: 'info' | 'debug' | 'off';
      /** Level used for 4xx/5xx responses. Defaults to `'warn'`. */
      errorLevel?: 'warn' | 'error';
    };

export interface HttpConfig {
  readonly enabled: boolean;
  readonly port: number;
  readonly host: string;
  readonly apiKey: string;
  readonly rateLimit?: RateLimitConfig;
  readonly security?: SecurityConfig;
  readonly sharding: boolean;
  readonly module?: Constructor;
  /**
   * Controls request-level access logging for `LoggerMiddleware`.
   * Pass the value through to `new LoggerMiddleware(config.accessLog)`.
   */
  readonly accessLog?: AccessLogConfig;
}
