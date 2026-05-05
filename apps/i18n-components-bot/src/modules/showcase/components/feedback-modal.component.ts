import { ModalComponent, ModalInput } from '@spraxium/components';

@ModalComponent({
  id: 'showcase_feedback',
  title: 'Feedback Form',
  i18n: { title: 'commands.components.showcase.modal.title' },
})
export class FeedbackModal {
  @ModalInput({
    label: 'Your name',
    placeholder: 'e.g. Alice',
    required: true,
    maxLength: 50,
    i18n: {
      label: 'commands.components.showcase.modal.fields.name.label',
      placeholder: 'commands.components.showcase.modal.fields.name.placeholder',
    },
  })
  name!: string;

  @ModalInput({
    label: 'Your message',
    placeholder: 'Tell us what you think…',
    style: 'paragraph',
    required: true,
    maxLength: 300,
    i18n: {
      label: 'commands.components.showcase.modal.fields.message.label',
      placeholder: 'commands.components.showcase.modal.fields.message.placeholder',
    },
  })
  message!: string;
}
