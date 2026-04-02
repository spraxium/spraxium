import type { Context, Next } from 'hono';
import { cors } from 'hono/cors';
import { DEFAULT_HEADERS, DEFAULT_METHODS } from '../constants';
import type { CorsConfig, HttpMiddleware } from '../interfaces';

export class CorsMiddleware implements HttpMiddleware {
  private readonly handler: ReturnType<typeof cors>;

  constructor(config: CorsConfig) {
    this.handler = cors({
      origin: config.origins.includes('*') ? '*' : (config.origins as Array<string>),
      allowMethods: (config.methods ?? DEFAULT_METHODS) as Array<string>,
      allowHeaders: (config.allowedHeaders ?? DEFAULT_HEADERS) as Array<string>,
      exposeHeaders: (config.exposedHeaders ?? []) as Array<string>,
      credentials: config.credentials ?? false,
      maxAge: config.maxAge ?? 600,
    });
  }

  handle(ctx: Context, next: Next): Promise<undefined | Response> {
    return this.handler(ctx, next) as Promise<undefined | Response>;
  }
}
