import { Module } from '@spraxium/common';
import { V2Service } from '@spraxium/components';
import { V2Command } from './commands/v2.command';
import { V2ClassCommandHandler } from './handlers/v2-class-command.handler';
import { V2DynamicCommandHandler } from './handlers/v2-dynamic-command.handler';
import { V2FluentCommandHandler } from './handlers/v2-fluent-command.handler';

@Module({
  providers: [V2Service],
  commands: [V2Command],
  handlers: [V2FluentCommandHandler, V2ClassCommandHandler, V2DynamicCommandHandler],
})
export class V2Module {}
