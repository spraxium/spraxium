import { ModalComponent, ModalInput, ModalTextDisplay } from '@spraxium/components';

@ModalTextDisplay({ content: 'Your feedback helps us improve. 🙌' })
@ModalComponent({ id: 'feedback', title: 'Share your feedback' })
export class FeedbackModal {
  @ModalInput({ label: 'Subject', placeholder: 'One-line summary', required: true, maxLength: 100 })
  subject!: string;

  @ModalInput({ label: 'Message', style: 'paragraph', placeholder: 'Tell us more…', required: true })
  message!: string;
}
