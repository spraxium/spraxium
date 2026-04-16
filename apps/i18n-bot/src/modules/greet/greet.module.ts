import { Module } from '@spraxium/common';
import { GreetCommand } from './commands/greet.command';
import { GreetMeHandler } from './handlers/greet-me.handler';
import { GreetUserHandler } from './handlers/greet-user.handler';

@Module({
  commands: [GreetCommand],
  handlers: [GreetMeHandler, GreetUserHandler],
})
export class GreetModule {}
