import { Guard, GuardOption } from '@spraxium/common';
import type { ExecutionContext, SpraxiumGuard } from '@spraxium/common';

/**
 * Restricts a command to a predefined list of bot owner user IDs.
 *
 * @example — per command:
 *   @UseGuards(withOptions(OwnerOnly, { ownerIds: ['123456789012345678'] }))
 *
 * @example — global:
 *   app.useGlobalGuards(OwnerOnly, { ownerIds: process.env.OWNER_IDS?.split(',') ?? [] });
 */
@Guard()
export class OwnerOnly implements SpraxiumGuard {
  @GuardOption({ default: [], required: true })
  public ownerIds!: Array<string>;

  public canActivate(ctx: ExecutionContext): boolean {
    return this.ownerIds.includes(ctx.getUserId());
  }
}
