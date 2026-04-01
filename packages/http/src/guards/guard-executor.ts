import type { Context } from 'hono';
import type { HttpGuard } from './api-key.guard';

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
