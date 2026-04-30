import { Guard, GuardOption } from '@spraxium/common';
import type { ExecutionContext, SpraxiumGuard } from '@spraxium/common';
import { ModalSubmitInteraction } from 'discord.js';

/**
 * Blocks the handler unless the invoking user has a specific role.
 *
 * The role ID is injected via @UseGuards(withOptions(VipRoleGuard, { roleId: '...' })).
 *
 * This guard works identically on slash commands AND component handlers
 * (buttons, selects, modals) because it only uses ctx.getMember(), which is
 * available on every Discord interaction regardless of type.
 */
@Guard()
export class VipRoleGuard implements SpraxiumGuard {
  @GuardOption({ required: true })
  public roleId!: string;

  public canActivate(ctx: ExecutionContext): boolean {
    // getGuildId() returns null in DMs — block them up front
    if (ctx.getGuildId() === null) return false;

    const member = ctx.getMember();
    if (!member) return false;

    // member.roles is a GuildMemberRoleManager (cached) or an array of snowflakes (API)
    const roles = 'cache' in member.roles ? member.roles.cache : member.roles;
    return Array.isArray(roles)
      ? roles.includes(this.roleId)
      : roles.has(this.roleId);
  }
}
