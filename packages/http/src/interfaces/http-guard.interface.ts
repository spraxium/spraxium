import type { Context } from 'hono';

export interface HttpGuard {
  canActivate(ctx: Context): Promise<boolean>;
}
