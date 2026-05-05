import { ModalCache, ModalComponent, ModalInput } from '@spraxium/components';

@ModalCache({ ttl: 300 })
@ModalComponent({
  id: 'profile_edit',
  title: 'Edit Profile',
  i18n: { title: 'commands.components.profile.modal.title' },
})
export class EditProfileModal {
  @ModalInput({
    label: 'Bio',
    placeholder: 'Write a short bio about yourself…',
    style: 'paragraph',
    required: false,
    maxLength: 200,
    i18n: {
      label: 'commands.components.profile.modal.fields.bio.label',
      placeholder: 'commands.components.profile.modal.fields.bio.placeholder',
    },
  })
  bio!: string;

  @ModalInput({
    label: 'Location',
    placeholder: 'Where are you from?',
    required: false,
    maxLength: 100,
    i18n: {
      label: 'commands.components.profile.modal.fields.location.label',
      placeholder: 'commands.components.profile.modal.fields.location.placeholder',
    },
  })
  location!: string;
}
