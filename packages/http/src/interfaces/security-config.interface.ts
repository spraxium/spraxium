/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export interface CorsConfig {
  /**
   * Allowed origins. Use `'*'` to allow all (not recommended for production). @default []
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly origins: ReadonlyArray<string>;
  /**
   * Allowed HTTP methods. @default ['GET','POST','PUT','PATCH','DELETE','OPTIONS']
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly methods?: ReadonlyArray<string>;
  /**
   * Allowed request headers. @default ['Content-Type','Authorization','X-Api-Key']
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly allowedHeaders?: ReadonlyArray<string>;
  /**
   * Headers exposed to the browser. @default []
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly exposedHeaders?: ReadonlyArray<string>;
  /**
   * Allow credentials (cookies, auth headers). @default false
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly credentials?: boolean;
  /**
   * Preflight cache duration in seconds. @default 600
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly maxAge?: number;
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export interface SecurityHeadersConfig {
  /**
   * X-Content-Type-Options: nosniff. @default true
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly noSniff?: boolean;
  /**
   * X-Frame-Options header value. @default 'DENY'
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly frameOptions?: 'DENY' | 'SAMEORIGIN' | false;
  /**
   * X-XSS-Protection: 1; mode=block. @default true
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly xssProtection?: boolean;
  /**
   * Strict-Transport-Security max-age in seconds. 0 to disable. @default 31536000
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly hstsMaxAge?: number;
  /**
   * Include subdomains in HSTS. @default true
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly hstsIncludeSubDomains?: boolean;
  /**
   * Referrer-Policy value. @default 'no-referrer'
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly referrerPolicy?: string | false;
  /**
   * Permissions-Policy header value. @default 'camera=(), microphone=(), geolocation=()'
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly permissionsPolicy?: string | false;
  /**
   * Content-Security-Policy header value. Set to false to disable. @default "default-src 'none'"
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly contentSecurityPolicy?: string | false;
  /**
   * Cross-Origin-Opener-Policy. @default 'same-origin'
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly crossOriginOpenerPolicy?: string | false;
  /**
   * Cross-Origin-Resource-Policy. @default 'same-origin'
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly crossOriginResourcePolicy?: string | false;
  /**
   * X-Permitted-Cross-Domain-Policies. @default 'none'
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly crossDomainPolicies?: string | false;
  /**
   * X-DNS-Prefetch-Control. @default 'off'
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly dnsPrefetchControl?: 'on' | 'off' | false;
  /**
   * X-Download-Options: noopen (IE-specific). @default true
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly downloadOptions?: boolean;
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export interface BodyLimitConfig {
  /**
   * Maximum body size in bytes. @default 102400 (100KB)
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly maxSize: number;
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export interface TrustedProxyConfig {
  /**
   * Trusted proxy IPs or CIDR ranges. Requests from these IPs use X-Forwarded-For. @default ['127.0.0.1','::1']
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly proxies: ReadonlyArray<string>;
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export interface SecurityConfig {
  /**
   * CORS configuration. Set to false to disable.
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly cors?: CorsConfig | false;
  /**
   * Security headers (helmet-like). Set to false to disable all.
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly headers?: SecurityHeadersConfig | false;
  /**
   * Request body size limit. Set to false to disable.
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly bodyLimit?: BodyLimitConfig | false;
  /**
   * Trusted proxy configuration.
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly trustedProxies?: TrustedProxyConfig;
  /**
   * Hide X-Powered-By / Server headers. @default true
   * @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration.
   */
  readonly hidePoweredBy?: boolean;
}
