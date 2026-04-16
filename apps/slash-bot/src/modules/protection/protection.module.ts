import { Module } from '@spraxium/common';
import { ModCommand } from './commands/mod.command';
import { ModKickHandler } from './handlers/mod-kick.handler';
import { ModTimeoutHandler } from './handlers/mod-timeout.handler';
import { ModWarnHandler } from './handlers/mod-warn.handler';

@Module({
  commands: [ModCommand],
  handlers: [ModWarnHandler, ModKickHandler, ModTimeoutHandler],
})
export class ProtectionModule {}
