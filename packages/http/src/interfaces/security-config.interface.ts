export interface CorsConfig {
  /** Allowed origins. Use `'*'` to allow all (not recommended for production). @default [] */
  readonly origins: ReadonlyArray<string>;
  /** Allowed HTTP methods. @default ['GET','POST','PUT','PATCH','DELETE','OPTIONS'] */
  readonly methods?: ReadonlyArray<string>;
  /** Allowed request headers. @default ['Content-Type','Authorization','X-Api-Key'] */
  readonly allowedHeaders?: ReadonlyArray<string>;
  /** Headers exposed to the browser. @default [] */
  readonly exposedHeaders?: ReadonlyArray<string>;
  /** Allow credentials (cookies, auth headers). @default false */
  readonly credentials?: boolean;
  /** Preflight cache duration in seconds. @default 600 */
  readonly maxAge?: number;
}

export interface SecurityHeadersConfig {
  /** X-Content-Type-Options: nosniff. @default true */
  readonly noSniff?: boolean;
  /** X-Frame-Options header value. @default 'DENY' */
  readonly frameOptions?: 'DENY' | 'SAMEORIGIN' | false;
  /** X-XSS-Protection: 1; mode=block. @default true */
  readonly xssProtection?: boolean;
  /** Strict-Transport-Security max-age in seconds. 0 to disable. @default 31536000 */
  readonly hstsMaxAge?: number;
  /** Include subdomains in HSTS. @default true */
  readonly hstsIncludeSubDomains?: boolean;
  /** Referrer-Policy value. @default 'no-referrer' */
  readonly referrerPolicy?: string | false;
  /** Permissions-Policy header value. @default 'camera=(), microphone=(), geolocation=()' */
  readonly permissionsPolicy?: string | false;
  /** Content-Security-Policy header value. Set to false to disable. @default "default-src 'none'" */
  readonly contentSecurityPolicy?: string | false;
  /** Cross-Origin-Opener-Policy. @default 'same-origin' */
  readonly crossOriginOpenerPolicy?: string | false;
  /** Cross-Origin-Resource-Policy. @default 'same-origin' */
  readonly crossOriginResourcePolicy?: string | false;
  /** X-Permitted-Cross-Domain-Policies. @default 'none' */
  readonly crossDomainPolicies?: string | false;
  /** X-DNS-Prefetch-Control. @default 'off' */
  readonly dnsPrefetchControl?: 'on' | 'off' | false;
  /** X-Download-Options: noopen (IE-specific). @default true */
  readonly downloadOptions?: boolean;
}

export interface BodyLimitConfig {
  /** Maximum body size in bytes. @default 102400 (100KB) */
  readonly maxSize: number;
}

export interface TrustedProxyConfig {
  /** Trusted proxy IPs or CIDR ranges. Requests from these IPs use X-Forwarded-For. @default ['127.0.0.1','::1'] */
  readonly proxies: ReadonlyArray<string>;
}

export interface SecurityConfig {
  /** CORS configuration. Set to false to disable. */
  readonly cors?: CorsConfig | false;
  /** Security headers (helmet-like). Set to false to disable all. */
  readonly headers?: SecurityHeadersConfig | false;
  /** Request body size limit. Set to false to disable. */
  readonly bodyLimit?: BodyLimitConfig | false;
  /** Trusted proxy configuration. */
  readonly trustedProxies?: TrustedProxyConfig;
  /** Hide X-Powered-By / Server headers. @default true */
  readonly hidePoweredBy?: boolean;
}

export const SECURITY_DEFAULTS: Required<Pick<SecurityConfig, 'hidePoweredBy'>> & {
  headers: Required<SecurityHeadersConfig>;
  cors: null;
  bodyLimit: BodyLimitConfig;
  trustedProxies: TrustedProxyConfig;
} = {
  hidePoweredBy: true,
  headers: {
    noSniff: true,
    frameOptions: 'DENY',
    xssProtection: true,
    hstsMaxAge: 31_536_000,
    hstsIncludeSubDomains: true,
    referrerPolicy: 'no-referrer',
    permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
    contentSecurityPolicy: "default-src 'none'",
    crossOriginOpenerPolicy: 'same-origin',
    crossOriginResourcePolicy: 'same-origin',
    crossDomainPolicies: 'none',
    dnsPrefetchControl: 'off',
    downloadOptions: true,
  },
  cors: null,
  bodyLimit: { maxSize: 102_400 },
  trustedProxies: { proxies: ['127.0.0.1', '::1'] },
};
