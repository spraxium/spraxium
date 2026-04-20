import { Module } from '@spraxium/common';
import { ButtonService, EmbedService } from '@spraxium/components';
import { ButtonsCommand } from './commands/buttons.command';
import { ApproveButtonHandler } from './handlers/approve-button.handler';
import { ButtonsCommandHandler } from './handlers/buttons-command.handler';
import { DeleteButtonHandler } from './handlers/delete-button.handler';
import { PrimaryButtonHandler } from './handlers/primary-button.handler';
import { SecondaryButtonHandler } from './handlers/secondary-button.handler';

@Module({
  providers: [EmbedService, ButtonService],
  commands: [ButtonsCommand],
  handlers: [
    ButtonsCommandHandler,
    PrimaryButtonHandler,
    SecondaryButtonHandler,
    ApproveButtonHandler,
    DeleteButtonHandler,
  ],
})
export class ButtonsModule {}
