import { Module } from '@spraxium/common';
import { ButtonService, EmbedService, ModalService, SelectService, V2Service } from '@spraxium/components';
import { ProfileCommand } from './commands/profile.command';
import { EditProfileButtonHandler } from './handlers/edit-profile-button.handler';
import { EditProfileModalHandler } from './handlers/edit-profile-modal.handler';
import { LocaleSelectHandler } from './handlers/locale-select.handler';
import { ProfileEditHandler } from './handlers/profile-edit-command.handler';
import { ProfileViewHandler } from './handlers/profile-view-command.handler';
import { ShareProfileButtonHandler } from './handlers/share-profile-button.handler';

@Module({
  providers: [ModalService],
  commands: [ProfileCommand],
  handlers: [
    ProfileViewHandler,
    ProfileEditHandler,
    EditProfileButtonHandler,
    ShareProfileButtonHandler,
    LocaleSelectHandler,
    EditProfileModalHandler,
  ],
})
export class ProfileModule {}
