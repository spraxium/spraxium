import type { Constructor } from '../types';
import type { RateLimitConfig } from './rate-limit-config.interface';

export interface HttpConfig {
  readonly enabled: boolean;
  readonly port: number;
  readonly host: string;
  readonly apiKey: string;
  readonly rateLimit?: RateLimitConfig;
  readonly sharding: boolean;
  readonly module?: Constructor;
}
