import { Module } from '@spraxium/common';
import { ModCommand } from './commands/mod.command';
import { ModKickHandler } from './handlers/mod-kick-command.handler';
import { ModTimeoutHandler } from './handlers/mod-timeout-command.handler';
import { ModWarnHandler } from './handlers/mod-warn-command.handler';

@Module({
  commands: [ModCommand],
  handlers: [ModWarnHandler, ModKickHandler, ModTimeoutHandler],
})
export class ProtectionModule {}
