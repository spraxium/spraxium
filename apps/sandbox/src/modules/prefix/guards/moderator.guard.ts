import { Guard } from '@spraxium/common';
import type { ExecutionContext, SpraxiumGuard } from '@spraxium/common';
import { PermissionDeniedException } from '@spraxium/core';
import type { GuildMember, Message } from 'discord.js';

@Guard()
export class ModeratorGuard implements SpraxiumGuard {
  public canActivate(ctx: ExecutionContext): boolean {
    const message = ctx.getInteraction() as Message;
    const member = message.member as GuildMember | null;

    if (!member) {
      throw new PermissionDeniedException({ permission: 'KickMembers' });
    }

    if (!member.permissions.has('KickMembers')) {
      throw new PermissionDeniedException({ permission: 'KickMembers' });
    }

    return true;
  }
}
