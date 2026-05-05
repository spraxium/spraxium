import { Module } from '@spraxium/common';
import { TopicsCommand } from './commands/topics.command';
import { TopicSelectHandler } from './handlers/topic-select.handler';
import { TopicsCommandHandler } from './handlers/topics-command.handler';

@Module({
  commands: [TopicsCommand],
  handlers: [TopicsCommandHandler, TopicSelectHandler],
})
export class TopicsModule {}
