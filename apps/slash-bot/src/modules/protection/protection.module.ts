import { Module } from '@spraxium/common';
import { ModCommand } from './commands/mod.command';
import { ModKickHandler } from './handlers/mod-kick.handler';
import { ModTimeoutHandler } from './handlers/mod-timeout.handler';
import { ModWarnHandler } from './handlers/mod-warn.handler';

@Module({
  commands: [ModCommand],
  handlers: [
    ModWarnHandler, // /mod warn   — GuildOnly + PermissionGuard(ManageMessages) + CooldownGuard(10s)
    ModKickHandler, // /mod kick   — GuildOnly + PermissionGuard(KickMembers)
    ModTimeoutHandler, // /mod timeout — GuildOnly + PermissionGuard(ModerateMembers)
  ],
})
export class ProtectionModule {}
