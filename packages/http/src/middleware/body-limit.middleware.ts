import type { Context, Next } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { type BodyLimitConfig, SECURITY_DEFAULTS } from '../http.config';
import type { HttpMiddleware } from './logger.middleware';

export class BodyLimitMiddleware implements HttpMiddleware {
  private readonly handler: ReturnType<typeof bodyLimit>;

  constructor(config?: BodyLimitConfig) {
    const maxSize = config?.maxSize ?? SECURITY_DEFAULTS.bodyLimit.maxSize;
    this.handler = bodyLimit({
      maxSize,
      onError: (ctx) => ctx.json({ ok: false, error: 'Payload too large', maxSize }, 413),
    });
  }

  handle(ctx: Context, next: Next): Promise<void | Response> {
    return this.handler(ctx, next) as Promise<void | Response>;
  }
}
