import type { Context, Next } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { SECURITY_DEFAULTS, type SecurityHeadersConfig } from '../http.config';
import type { HttpMiddleware } from './logger.middleware';

export class SecurityHeadersMiddleware implements HttpMiddleware {
  private readonly handler: ReturnType<typeof secureHeaders>;

  constructor(config?: SecurityHeadersConfig | false) {
    if (config === false) {
      this.handler = (_ctx: Context, next: Next) => next();
      return;
    }

    const c = { ...SECURITY_DEFAULTS.headers, ...config };

    this.handler = secureHeaders({
      xContentTypeOptions: c.noSniff ? 'nosniff' : undefined,
      xFrameOptions: c.frameOptions || undefined,
      xXssProtection: c.xssProtection ? '1; mode=block' : undefined,
      strictTransportSecurity:
        c.hstsMaxAge && c.hstsMaxAge > 0
          ? `max-age=${c.hstsMaxAge}${c.hstsIncludeSubDomains ? '; includeSubDomains' : ''}`
          : undefined,
      referrerPolicy: c.referrerPolicy || undefined,
      permissionsPolicy: c.permissionsPolicy
        ? { camera: [''], microphone: [''], geolocation: [''] }
        : undefined,
      contentSecurityPolicy: c.contentSecurityPolicy ? { defaultSrc: ["'none'"] } : undefined,
      crossOriginOpenerPolicy: c.crossOriginOpenerPolicy || undefined,
      crossOriginResourcePolicy: c.crossOriginResourcePolicy || undefined,
      xPermittedCrossDomainPolicies: c.crossDomainPolicies || undefined,
      xDnsPrefetchControl: c.dnsPrefetchControl || undefined,
      xDownloadOptions: c.downloadOptions ? 'noopen' : undefined,
    });
  }

  handle(ctx: Context, next: Next): Promise<void | Response> {
    return this.handler(ctx, next) as Promise<void | Response>;
  }
}
