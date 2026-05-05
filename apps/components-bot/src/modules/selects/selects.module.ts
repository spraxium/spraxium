import { Module } from '@spraxium/common';
import { EmbedService, SelectService } from '@spraxium/components';
import { SelectsCommand } from './commands/selects.command';
import { AreasMultiSelectCommandHandler } from './handlers/areas-multi-select-command.handler';
import { MultiSelectCommandHandler } from './handlers/multi-select-command.handler';
import { StringSelectCommandHandler } from './handlers/string-select-command.handler';
import { TopicStringSelectCommandHandler } from './handlers/topic-string-select-command.handler';
import { TypesSelectCommandHandler } from './handlers/types-select-command.handler';

@Module({
  providers: [EmbedService, SelectService],
  commands: [SelectsCommand],
  handlers: [
    StringSelectCommandHandler,
    MultiSelectCommandHandler,
    TypesSelectCommandHandler,
    TopicStringSelectCommandHandler,
    AreasMultiSelectCommandHandler,
  ],
})
export class SelectsModule {}
