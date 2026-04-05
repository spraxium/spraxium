import { Module } from '@spraxium/common';
import { GreetCommand } from './commands/greet.command';
import { GreetMeHandler } from './handlers/greet-me-command.handler';
import { GreetUserHandler } from './handlers/greet-user-command.handler';

@Module({
  commands: [GreetCommand],
  handlers: [GreetMeHandler, GreetUserHandler],
})
export class GreetModule {}
