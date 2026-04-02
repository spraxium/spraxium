import type {
  BodyLimitConfig,
  SecurityConfig,
  SecurityHeadersConfig,
  TrustedProxyConfig,
} from '../interfaces';

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
