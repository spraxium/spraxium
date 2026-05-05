export interface RateLimitConfig {
  /** Sliding-window duration in milliseconds. */
  readonly windowMs: number;
  /** Maximum requests allowed per client within `windowMs`. */
  readonly max: number;
  /**
   * IPs of reverse proxies you trust to set the `X-Forwarded-For` header.
   * Requests whose direct peer address is in this list will use the leftmost
   * entry of `X-Forwarded-For` as the rate-limit key. For any other request
   * the header is ignored and the direct peer IP is used.
   *
   * If omitted, `X-Forwarded-For` is never trusted and only the direct peer
   * IP is used - the safe default that prevents header-spoofing bypass.
   *
   * Should mirror the `security.trustedProxies.proxies` you pass to
   * `defineHttp()`.
   *
   * @default []
   */
  readonly trustedProxies?: ReadonlyArray<string>;
}
