import { logger } from '@spraxium/logger';
import type { Context, Next } from 'hono';
import type { AccessLogConfig, HttpMiddleware } from '../interfaces';

const log = logger.child('HttpLogger');

export class LoggerMiddleware implements HttpMiddleware {
  constructor(private readonly config?: AccessLogConfig) {}

  async handle(ctx: Context, next: Next): Promise<undefined> {
    if (this.config === false) {
      await next();
      return;
    }

    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    const status = ctx.res.status;
    const line = `${ctx.req.method} ${ctx.req.path} ${status} ${ms}ms`;

    if (status >= 400) {
      const level = typeof this.config === 'object' ? (this.config.errorLevel ?? 'warn') : 'warn';
      log[level](line);
    } else {
      const level = typeof this.config === 'object' ? (this.config.successLevel ?? 'info') : 'info';
      if (level !== 'off') log[level](line);
    }
  }
}
