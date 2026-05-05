import { Module } from '@spraxium/common';
import { QuickActionsCommand } from './commands/quick-actions.command';
import { QuickActionsCommandHandler } from './handlers/quick-actions-command.handler';
import {
  ArchiveButtonHandler,
  DeleteButtonHandler,
  ExportButtonHandler,
  ModeSelectHandler,
  MuteButtonHandler,
  PinButtonHandler,
  RefreshButtonHandler,
  ShareButtonHandler,
} from './handlers/quick-actions.handlers';

@Module({
  commands: [QuickActionsCommand],
  handlers: [
    QuickActionsCommandHandler,
    RefreshButtonHandler,
    ExportButtonHandler,
    ShareButtonHandler,
    ArchiveButtonHandler,
    DeleteButtonHandler,
    PinButtonHandler,
    MuteButtonHandler,
    ModeSelectHandler,
  ],
})
export class QuickActionsModule {}
