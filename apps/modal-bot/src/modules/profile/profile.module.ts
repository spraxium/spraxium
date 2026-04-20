import { Module } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import { ProfileCommand } from './commands/profile.command';
import { ProfileModalHandler } from './handlers/profile-modal.handler';
import { ProfileSetupCommandHandler } from './handlers/profile-setup-command.handler';

@Module({
  providers: [ModalService],
  commands: [ProfileCommand],
  handlers: [ProfileSetupCommandHandler, ProfileModalHandler],
})
export class ProfileModule {}
