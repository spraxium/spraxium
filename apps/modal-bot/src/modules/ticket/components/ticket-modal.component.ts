import {
  ModalCache,
  ModalComponent,
  ModalInput,
  ModalTextDisplay,
  ModalValidate,
  ModalValidationConfig,
  emailFormat,
  minWords,
} from '@spraxium/components';

@ModalValidationConfig({
  ephemeral: true,
  embed: (errors) => ({
    title: '❌ Validation failed',
    description: errors.map((e) => `• **${e.label}**: ${e.message}`).join('\n'),
    color: 0xed4245,
  }),
})
@ModalCache({ ttl: 600 })
@ModalTextDisplay({ content: '🎫 Fill in your issue details. Your answers are cached for 10 minutes.' })
@ModalComponent({ id: 'ticket', title: 'Open a Support Ticket' })
export class TicketModal {
  @ModalValidate([minWords(3, 'Please summarize your issue in at least 3 words.')])
  @ModalInput({
    label: 'Subject',
    placeholder: 'Brief summary of your issue',
    required: true,
    maxLength: 100,
  })
  subject!: string;

  @ModalValidate([minWords(10, 'Please describe the issue in at least 10 words.')])
  @ModalInput({
    label: 'Description',
    style: 'paragraph',
    placeholder: 'Describe the issue in detail...',
    required: true,
  })
  description!: string;

  @ModalValidate([emailFormat()])
  @ModalInput({ label: 'Contact email (optional)', placeholder: 'you@example.com' })
  email!: string;
}
