import { Guard, GuardOption } from '@spraxium/common';
import type { ExecutionContext, SpraxiumGuard } from '@spraxium/common';

/**
 * Module-level store so cooldown state persists across instances.
 * Key format: `userId:commandName`
 */
const cooldownExpiry = new Map<string, number>();

/**
 * Rate-limits a command per user.
 * A user who triggers the command must wait `cooldown` milliseconds before
 * invoking it again.
 *
 * @example
 *   @UseGuards(withOptions(CooldownGuard, { cooldown: 5_000 }))
 *   export class PingHandler { ... }
 */
@Guard()
export class CooldownGuard implements SpraxiumGuard {
  /** How long (in ms) the user must wait between invocations. */
  @GuardOption({ required: true })
  public cooldown!: number;

  public canActivate(ctx: ExecutionContext): boolean {
    const key = `${ctx.getUserId()}:${ctx.getCommandName()}`;
    const now = Date.now();
    const expiresAt = cooldownExpiry.get(key) ?? 0;

    if (now < expiresAt) return false;

    // Evict expired entry before writing the new one
    cooldownExpiry.delete(key);
    cooldownExpiry.set(key, now + this.cooldown);
    return true;
  }
}
