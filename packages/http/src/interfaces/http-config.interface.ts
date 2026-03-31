import type { Constructor } from '../types';
import type { HttpGuard } from './http-guard.interface';
import type { HttpMiddleware } from './http-middleware.interface';
import type { RateLimitConfig } from './rate-limit-config.interface';

export interface HttpConfig {
  readonly enabled: boolean;
  readonly port: number;
  readonly host: string;
  readonly apiKey: string;
  readonly rateLimit?: RateLimitConfig;
  readonly sharding: boolean;
  readonly controllers?: Array<Constructor>;
  readonly guards?: Array<HttpGuard>;
  readonly middleware?: Array<HttpMiddleware>;
  readonly middlewareProviders?: Map<Constructor, HttpMiddleware>;
}
