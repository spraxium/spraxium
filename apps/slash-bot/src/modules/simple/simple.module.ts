import { Module } from '@spraxium/common';
import { ColorCommand } from './commands/color.command';
import { InspectCommand } from './commands/inspect.command';
import { PingCommand } from './commands/ping.command';
import { ColorHandler } from './handlers/color.handler';
import { InspectHandler } from './handlers/inspect.handler';
import { PingHandler } from './handlers/ping.handler';

@Module({
  commands: [PingCommand, InspectCommand, ColorCommand],
  handlers: [
    PingHandler, // /ping
    InspectHandler, // /inspect — all 9 option types
    ColorHandler, // /color  — String + Integer with choices
  ],
})
export class SimpleModule {}
