import { Module } from '@spraxium/common';
import { FilterCommand } from './commands/filter.command';
import { TopicsCommand } from './commands/topics.command';
import { FilterCommandHandler } from './handlers/filter-command.handler';
import { FilterSelectHandler } from './handlers/filter-select.handler';
import { TopicSelectHandler } from './handlers/topic-select.handler';
import { TopicsCommandHandler } from './handlers/topics-command.handler';

@Module({
  commands: [TopicsCommand, FilterCommand],
  handlers: [TopicsCommandHandler, TopicSelectHandler, FilterCommandHandler, FilterSelectHandler],
})
export class TopicsModule {}
