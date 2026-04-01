import type { Context, Next } from 'hono';
import type { RateLimitConfig } from '../http.config';
import type { HttpMiddleware } from './logger.middleware';

interface WindowEntry {
  count: number;
  windowStart: number;
}

export class RateLimitMiddleware implements HttpMiddleware {
  private readonly store = new Map<string, WindowEntry>();
  private readonly cleanupInterval: ReturnType<typeof setInterval>;

  constructor(private readonly config: RateLimitConfig) {
    this.cleanupInterval = setInterval(() => this.evict(), config.windowMs);
    if (this.cleanupInterval.unref) this.cleanupInterval.unref();
  }

  async handle(ctx: Context, next: Next): Promise<void> {
    const ip = ctx.req.header('x-forwarded-for') ?? 'unknown';
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

  private evict(): void {
    const cutoff = Date.now() - this.config.windowMs;
    for (const [ip, entry] of this.store) {
      if (entry.windowStart < cutoff) this.store.delete(ip);
    }
  }
}
