import { Module } from '@spraxium/common';
import { ButtonService, SelectService, V2Service } from '@spraxium/components';
import { StatsCommand } from './commands/stats.command';
import { StatsCommandHandler } from './handlers/stats-command.handler';

@Module({
  commands: [StatsCommand],
  handlers: [StatsCommandHandler],
})
export class StatsModule {}
