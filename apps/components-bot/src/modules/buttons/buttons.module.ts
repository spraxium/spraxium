import { Module } from '@spraxium/common';
import { ButtonService, EmbedService } from '@spraxium/components';
import { ButtonsCommand } from './commands/buttons.command';
import { ApproveButtonCommandHandler } from './handlers/approve-button-command.handler';
import { ButtonsCommandHandler } from './handlers/buttons-command.handler';
import { DeleteButtonCommandHandler } from './handlers/delete-button-command.handler';
import { PrimaryButtonCommandHandler } from './handlers/primary-button-command.handler';
import { SecondaryButtonCommandHandler } from './handlers/secondary-button-command.handler';

@Module({
  providers: [EmbedService, ButtonService],
  commands: [ButtonsCommand],
  handlers: [
    ButtonsCommandHandler,
    PrimaryButtonCommandHandler,
    SecondaryButtonCommandHandler,
    ApproveButtonCommandHandler,
    DeleteButtonCommandHandler,
  ],
})
export class ButtonsModule {}
