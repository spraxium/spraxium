import { Module } from '@spraxium/common';
import { PingCommandHandler } from './handlers/ping-command.handler';
import { PingCommand } from './commands/ping.command';

@Module({
  commands: [PingCommand],
  handlers: [PingCommandHandler],
})
export class PingModule {}
