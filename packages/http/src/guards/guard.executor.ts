import type { Context } from 'hono';
import type { HttpGuard } from '../interfaces';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export class GuardExecutor {
  constructor(private readonly guards: ReadonlyArray<HttpGuard>) {}

  async execute(ctx: Context): Promise<boolean> {
    for (const guard of this.guards) {
      const allowed = await guard.canActivate(ctx);
      if (!allowed) {
        ctx.res = ctx.json({ ok: false, error: 'Unauthorized' }, 401);
        return false;
      }
    }
    return true;
  }
}
