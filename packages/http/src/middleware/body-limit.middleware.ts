import type { Context, Next } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { SECURITY_DEFAULTS } from '../constants';
import type { BodyLimitConfig, HttpMiddleware } from '../interfaces';

export class BodyLimitMiddleware implements HttpMiddleware {
  private readonly handler: ReturnType<typeof bodyLimit>;

  constructor(config?: BodyLimitConfig) {
    const maxSize = config?.maxSize ?? SECURITY_DEFAULTS.bodyLimit.maxSize;
    this.handler = bodyLimit({
      maxSize,
      onError: (ctx) => ctx.json({ ok: false, error: 'Payload too large', maxSize }, 413),
    });
  }

  handle(ctx: Context, next: Next): Promise<undefined | Response> {
    return this.handler(ctx, next) as Promise<undefined | Response>;
  }
}
