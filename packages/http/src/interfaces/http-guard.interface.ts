import type { Context } from 'hono';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export interface HttpGuard {
  canActivate(ctx: Context): Promise<boolean>;
}
