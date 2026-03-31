import type { Context, Next } from 'hono';
import type { HttpMiddleware } from '../interfaces';

export class LoggerMiddleware implements HttpMiddleware {
  async handle(ctx: Context, next: Next): Promise<void> {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    const status = ctx.res.status;
    const line = `${ctx.req.method} ${ctx.req.path} ${status} ${ms}ms`;
    if (status >= 400) {
      console.warn(`[spraxium/http] ${line}`);
    }
  }
}
