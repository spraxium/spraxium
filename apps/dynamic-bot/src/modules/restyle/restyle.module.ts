import { Module } from '@spraxium/common';
import { RestyleCommand } from './commands/restyle.command';
import { RestyleCommandHandler } from './handlers/restyle-command.handler';
import {
  ArchiveButtonHandler,
  DiscardButtonHandler,
  PickSelectHandler,
  PreviewButtonHandler,
  SaveButtonHandler,
} from './handlers/restyle.handlers';

@Module({
  commands: [RestyleCommand],
  handlers: [
    RestyleCommandHandler,
    SaveButtonHandler,
    DiscardButtonHandler,
    ArchiveButtonHandler,
    PreviewButtonHandler,
    PickSelectHandler,
  ],
})
export class RestyleModule {}
