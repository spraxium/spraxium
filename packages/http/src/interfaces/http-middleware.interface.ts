import type { Context, Next } from 'hono';

export interface HttpMiddleware {
  handle(ctx: Context, next: Next): Promise<void | Response>;
}
