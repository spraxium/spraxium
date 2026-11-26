import type { Context, Next } from 'hono';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export interface HttpMiddleware {
  handle(ctx: Context, next: Next): Promise<undefined | Response>;
}
