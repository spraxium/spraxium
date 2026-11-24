export interface CorsConfig {
  readonly origins: ReadonlyArray<string>;

  readonly methods?: ReadonlyArray<string>;

  readonly allowedHeaders?: ReadonlyArray<string>;

  readonly exposedHeaders?: ReadonlyArray<string>;

  readonly credentials?: boolean;

  readonly maxAge?: number;
}

export interface SecurityHeadersConfig {
  readonly noSniff?: boolean;

  readonly frameOptions?: 'DENY' | 'SAMEORIGIN' | false;

  readonly xssProtection?: boolean;

  readonly hstsMaxAge?: number;

  readonly hstsIncludeSubDomains?: boolean;

  readonly referrerPolicy?: string | false;

  readonly permissionsPolicy?: string | false;

  readonly contentSecurityPolicy?: string | false;

  readonly crossOriginOpenerPolicy?: string | false;

  readonly crossOriginResourcePolicy?: string | false;

  readonly crossDomainPolicies?: string | false;

  readonly dnsPrefetchControl?: 'on' | 'off' | false;

  readonly downloadOptions?: boolean;
}

export interface BodyLimitConfig {
  readonly maxSize: number;
}

export interface TrustedProxyConfig {
  readonly proxies: ReadonlyArray<string>;
}

export interface SecurityConfig {
  readonly cors?: CorsConfig | false;

  readonly headers?: SecurityHeadersConfig | false;

  readonly bodyLimit?: BodyLimitConfig | false;

  readonly trustedProxies?: TrustedProxyConfig;

  readonly hidePoweredBy?: boolean;
}
