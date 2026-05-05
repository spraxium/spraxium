import { Module } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import { ProfileCommand } from './commands/profile.command';
import { ProfileModalSubmitCommandHandler } from './handlers/profile-modal-submit-command.handler';
import { ProfileSetupCommandHandler } from './handlers/profile-setup-command.handler';

@Module({
  providers: [ModalService],
  commands: [ProfileCommand],
  handlers: [ProfileSetupCommandHandler, ProfileModalSubmitCommandHandler],
})
export class ProfileModule {}
