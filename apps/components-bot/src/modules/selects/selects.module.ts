import { Module } from '@spraxium/common';
import { EmbedService, SelectService } from '@spraxium/components';
import { SelectsCommand } from './commands/selects.command';
import { AreasMultiSelectHandler } from './handlers/areas-multi-select.handler';
import { MultiSelectCommandHandler } from './handlers/multi-select-command.handler';
import { StringSelectCommandHandler } from './handlers/string-select-command.handler';
import { TopicStringSelectHandler } from './handlers/topic-string-select.handler';
import { TypesSelectCommandHandler } from './handlers/types-select-command.handler';

@Module({
  providers: [EmbedService, SelectService],
  commands: [SelectsCommand],
  handlers: [
    StringSelectCommandHandler,
    MultiSelectCommandHandler,
    TypesSelectCommandHandler,
    TopicStringSelectHandler,
    AreasMultiSelectHandler,
  ],
})
export class SelectsModule {}
