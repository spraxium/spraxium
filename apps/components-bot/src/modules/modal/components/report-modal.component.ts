import {
  ModalCache,
  ModalComponent,
  ModalInput,
  ModalValidate,
  ModalValidationConfig,
  emailFormat,
  minWords,
} from '@spraxium/components';

@ModalValidationConfig({
  ephemeral: true,
  embed: (errors) => ({
    title: '❌ Please fix the following',
    description: errors.map((e) => `• **${e.label}**: ${e.message}`).join('\n'),
    color: 0xed4245,
  }),
})
@ModalCache({ ttl: 300 })
@ModalComponent({ id: 'report', title: 'Report an issue' })
export class ReportModal {
  @ModalValidate([minWords(3, 'Please use at least 3 words.')])
  @ModalInput({ label: 'What happened?', style: 'paragraph', required: true })
  description!: string;

  @ModalValidate([emailFormat()])
  @ModalInput({ label: 'Your e-mail (optional)', placeholder: 'you@example.com' })
  email!: string;
}
