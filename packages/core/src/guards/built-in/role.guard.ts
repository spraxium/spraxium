import { Guard, GuardOption } from '@spraxium/common';
import type { ExecutionContext, SpraxiumGuard } from '@spraxium/common';

/**
 * Checks that the invoking member has at least one of the listed role
 * names or role IDs.
 *
 * Works with all interaction types (ChatInput, Button, SelectMenu, Modal, etc.)
 * and Message-based handlers.
 *
 * @example
 *   @UseGuards(withOptions(RoleGuard, { roles: ['Moderator', '1234567890'] }))
 */
@Guard()
export class RoleGuard implements SpraxiumGuard {
  @GuardOption({ required: true })
  public roles!: Array<string>;

  public canActivate(ctx: ExecutionContext): boolean {
    if (ctx.getGuildId() === null) return false;

    const member = ctx.getMember();
    if (!member || !('roles' in member)) return false;

    const memberRoles = member.roles;

    // GuildMember: roles is a RoleManager with a .cache Map (id → Role)
    if (memberRoles && typeof memberRoles === 'object' && 'cache' in memberRoles) {
      const cache = (memberRoles as { cache: Map<string, { id: string; name: string }> }).cache;
      return this.roles.some((r) => cache.has(r) || [...cache.values()].some((role) => role.name === r));
    }

    // APIInteractionGuildMember: roles is a string[] of role IDs only
    if (Array.isArray(memberRoles)) {
      return this.roles.some((r) => (memberRoles as Array<string>).includes(r));
    }

    return false;
  }
}
