export interface RateLimitConfig {
  readonly windowMs: number;

  readonly max: number;

  readonly trustedProxies?: ReadonlyArray<string>;
}
