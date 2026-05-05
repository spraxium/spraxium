import type { Context, Next } from 'hono';
import type { HttpMiddleware, RateLimitConfig, WindowEntry } from '../interfaces';

/**
 * Typing shim for the pieces of `ctx.env` that Hono's Node adapter (and a few
 * others) expose. Kept local to avoid a hard dependency on any particular
 * adapter's type surface.
 */
interface HonoEnvShim {
  readonly incoming?: { readonly socket?: { readonly remoteAddress?: string } };
  readonly remoteAddr?: { readonly address?: string };
}

export class RateLimitMiddleware implements HttpMiddleware {
  private readonly store = new Map<string, WindowEntry>();
  private readonly cleanupInterval: ReturnType<typeof setInterval>;
  private readonly trustedProxies: ReadonlySet<string>;

  constructor(private readonly config: RateLimitConfig) {
    this.trustedProxies = new Set(config.trustedProxies ?? []);
    this.cleanupInterval = setInterval(() => this.evict(), config.windowMs);
    if (this.cleanupInterval.unref) this.cleanupInterval.unref();
  }

  async handle(ctx: Context, next: Next): Promise<undefined> {
    const ip = this.resolveClientIp(ctx);
    const now = Date.now();
    const entry = this.store.get(ip);

    if (!entry || now - entry.windowStart >= this.config.windowMs) {
      this.store.set(ip, { count: 1, windowStart: now });
      await next();
      return;
    }

    if (entry.count >= this.config.max) {
      ctx.res = ctx.json({ ok: false, error: 'Too many requests' }, 429);
      return;
    }

    entry.count += 1;
    await next();
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
  }

  /**
   * Resolves the bucket key for the request. Direct peer IP is used by default;
   * `X-Forwarded-For` is honoured only when the direct peer is explicitly listed
   * as a trusted proxy. This prevents an unauthenticated client from bypassing
   * the limiter by spoofing the header.
   */
  private resolveClientIp(ctx: Context): string {
    const directIp = RateLimitMiddleware.getDirectIp(ctx);

    if (directIp && this.trustedProxies.has(directIp)) {
      const forwarded = ctx.req.header('x-forwarded-for');
      const clientIp = RateLimitMiddleware.parseLeftmost(forwarded);
      if (clientIp) return clientIp;
    }

    return directIp ?? 'unknown';
  }

  private static getDirectIp(ctx: Context): string | undefined {
    const env = ctx.env as HonoEnvShim | undefined;
    const fromIncoming = env?.incoming?.socket?.remoteAddress;
    if (fromIncoming) return fromIncoming;
    return env?.remoteAddr?.address;
  }

  private static parseLeftmost(header: string | undefined): string | undefined {
    if (!header) return undefined;
    const first = header.split(',')[0]?.trim();
    return first ? first : undefined;
  }

  private evict(): void {
    const cutoff = Date.now() - this.config.windowMs;
    for (const [ip, entry] of this.store) {
      if (entry.windowStart < cutoff) this.store.delete(ip);
    }
  }
}
