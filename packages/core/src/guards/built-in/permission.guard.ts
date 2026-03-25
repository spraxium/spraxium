import { Guard, GuardOption } from '@spraxium/common';
import type { ExecutionContext, SpraxiumGuard } from '@spraxium/common';
import { PermissionsBitField, type PermissionsString } from 'discord.js';

/**
 * Checks that the invoking member has ALL of the listed Discord permissions.
 *
 * Works with all interaction types (ChatInput, Button, SelectMenu, Modal, etc.)
 * and Message-based handlers.
 *
 * @example
 *   @UseGuards(withOptions(PermissionGuard, { permissions: ['BanMembers', 'KickMembers'] }))
 */
@Guard()
export class PermissionGuard implements SpraxiumGuard {
  @GuardOption({ required: true })
  public permissions!: Array<PermissionsString>;

  public canActivate(ctx: ExecutionContext): boolean {
    if (ctx.getGuildId() === null) return false;

    const memberPerms = ctx.getMemberPermissions();
    if (!memberPerms) return false;

    return new PermissionsBitField(this.permissions).toArray().every((p) => memberPerms.has(p));
  }
}
