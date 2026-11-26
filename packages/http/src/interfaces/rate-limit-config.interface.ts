/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export interface RateLimitConfig {
  /**
   * Sliding-window duration in milliseconds.
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly windowMs: number;
  /**
   * Maximum requests allowed per client within `windowMs`.
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
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
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly trustedProxies?: ReadonlyArray<string>;
}
