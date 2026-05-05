import type { Context, Next } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { SECURITY_DEFAULTS } from '../constants';
import type { HttpMiddleware, SecurityHeadersConfig } from '../interfaces';

export class SecurityHeadersMiddleware implements HttpMiddleware {
  private readonly handler: ReturnType<typeof secureHeaders>;

  constructor(config?: SecurityHeadersConfig | false) {
    if (config === false) {
      this.handler = (_ctx: Context, next: Next) => next();
      return;
    }

    const c = { ...SECURITY_DEFAULTS.headers, ...config };
    const permissionsPolicyHeader = typeof c.permissionsPolicy === 'string' ? c.permissionsPolicy : undefined;
    const contentSecurityPolicyHeader =
      typeof c.contentSecurityPolicy === 'string' ? c.contentSecurityPolicy : undefined;

    const baseHandler = secureHeaders({
      xContentTypeOptions: c.noSniff ? 'nosniff' : undefined,
      xFrameOptions: c.frameOptions || undefined,
      xXssProtection: c.xssProtection ? '1; mode=block' : undefined,
      strictTransportSecurity:
        c.hstsMaxAge && c.hstsMaxAge > 0
          ? `max-age=${c.hstsMaxAge}${c.hstsIncludeSubDomains ? '; includeSubDomains' : ''}`
          : undefined,
      referrerPolicy: c.referrerPolicy || undefined,
      permissionsPolicy: c.permissionsPolicy
        ? permissionsPolicyHeader
          ? undefined
          : { camera: [''], microphone: [''], geolocation: [''] }
        : undefined,
      contentSecurityPolicy: c.contentSecurityPolicy
        ? contentSecurityPolicyHeader
          ? undefined
          : { defaultSrc: ["'none'"] }
        : undefined,
      crossOriginOpenerPolicy: c.crossOriginOpenerPolicy || undefined,
      crossOriginResourcePolicy: c.crossOriginResourcePolicy || undefined,
      xPermittedCrossDomainPolicies: c.crossDomainPolicies || undefined,
      xDnsPrefetchControl: c.dnsPrefetchControl || undefined,
      xDownloadOptions: c.downloadOptions ? 'noopen' : undefined,
    });

    this.handler = async (ctx: Context, next: Next): Promise<undefined | Response> => {
      const result = (await baseHandler(ctx, next)) as undefined | Response;
      if (permissionsPolicyHeader) {
        ctx.res.headers.set('Permissions-Policy', permissionsPolicyHeader);
      }
      if (contentSecurityPolicyHeader) {
        ctx.res.headers.set('Content-Security-Policy', contentSecurityPolicyHeader);
      }
      return result;
    };
  }

  handle(ctx: Context, next: Next): Promise<undefined | Response> {
    return this.handler(ctx, next) as Promise<undefined | Response>;
  }
}
