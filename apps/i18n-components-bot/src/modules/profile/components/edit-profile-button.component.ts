import { Button } from '@spraxium/components';

@Button({
  customId: 'profile_edit',
  label: '✏️ Edit Profile',
  style: 'primary',
  i18n: { label: 'commands.components.profile.buttons.edit' },
})
export class EditProfileButton {}
