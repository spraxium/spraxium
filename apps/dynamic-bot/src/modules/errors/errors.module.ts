import { Module } from '@spraxium/common';
import { ErrorsCommand } from './commands/errors.command';
import { ErrorsCommandHandler } from './handlers/errors-command.handler';
import { BoomButtonHandler, ExpiredButtonHandler } from './handlers/errors.handlers';

@Module({
  commands: [ErrorsCommand],
  handlers: [ErrorsCommandHandler, BoomButtonHandler, ExpiredButtonHandler],
})
export class ErrorsModule {}
