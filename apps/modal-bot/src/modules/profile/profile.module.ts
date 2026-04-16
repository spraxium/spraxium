import { Module } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import { ProfileCommand } from './commands/profile.command';
import { ProfileModalHandler } from './handlers/profile-modal.handler';
import { ProfileSetupHandler } from './handlers/profile-setup.handler';

@Module({
  providers: [ModalService],
  commands: [ProfileCommand],
  handlers: [
    ProfileSetupHandler, // /profile setup — opens ProfileModal
    ProfileModalHandler, // handles ProfileModal submission
  ],
})
export class ProfileModule {}
