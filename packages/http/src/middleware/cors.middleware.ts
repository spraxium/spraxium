import type { Context, Next } from 'hono';
import { cors } from 'hono/cors';
import type { CorsConfig } from '../http.config';
import type { HttpMiddleware } from './logger.middleware';

const DEFAULT_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
const DEFAULT_HEADERS = ['Content-Type', 'Authorization', 'X-Api-Key'];

export class CorsMiddleware implements HttpMiddleware {
  private readonly handler: ReturnType<typeof cors>;

  constructor(config: CorsConfig) {
    this.handler = cors({
      origin: config.origins.includes('*') ? '*' : (config.origins as string[]),
      allowMethods: (config.methods ?? DEFAULT_METHODS) as string[],
      allowHeaders: (config.allowedHeaders ?? DEFAULT_HEADERS) as string[],
      exposeHeaders: (config.exposedHeaders ?? []) as string[],
      credentials: config.credentials ?? false,
      maxAge: config.maxAge ?? 600,
    });
  }

  handle(ctx: Context, next: Next): Promise<void | Response> {
    return this.handler(ctx, next) as Promise<void | Response>;
  }
}
