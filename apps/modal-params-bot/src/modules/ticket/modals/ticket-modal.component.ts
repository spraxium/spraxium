import { ModalComponent, ModalDynamic, ModalInput, ModalWhen } from '@spraxium/components';

export type TicketCategory = 'bug_report' | 'feature_request' | 'billing';

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  bug_report: '🐛 Bug Report',
  feature_request: '✨ Feature Request',
  billing: '💳 Billing',
};

export interface TicketModalData {
  category: TicketCategory;
}

@ModalDynamic<TicketModalData>()
@ModalComponent({ id: 'ticket_inline', title: 'Open a Ticket' })
export class TicketInlineModal {
  @ModalInput({
    label: 'Subject',
    placeholder: 'Brief summary of your issue',
    required: true,
    maxLength: 100,
  })
  subject!: string;

  @ModalInput({
    label: 'Description',
    placeholder: 'Describe the issue in detail',
    style: 'paragraph',
    required: true,
  })
  description!: string;

  @ModalWhen((d: TicketModalData) => d.category === 'bug_report')
  @ModalInput({ label: 'Steps to reproduce', placeholder: '1. Go to…\n2. Click…', style: 'paragraph' })
  steps!: string;

  @ModalWhen((d: TicketModalData) => d.category === 'billing')
  @ModalInput({ label: 'Invoice / Order ID', placeholder: 'e.g. INV-0042' })
  invoiceId!: string;
}

@ModalDynamic<TicketModalData>()
@ModalComponent({ id: 'ticket_payload', title: 'Open a Ticket' })
export class TicketPayloadModal {
  @ModalInput({
    label: 'Subject',
    placeholder: 'Brief summary of your issue',
    required: true,
    maxLength: 100,
  })
  subject!: string;

  @ModalInput({
    label: 'Description',
    placeholder: 'Describe the issue in detail',
    style: 'paragraph',
    required: true,
  })
  description!: string;

  @ModalWhen((d: TicketModalData) => d.category === 'bug_report')
  @ModalInput({ label: 'Steps to reproduce', placeholder: '1. Go to…\n2. Click…', style: 'paragraph' })
  steps!: string;

  @ModalWhen((d: TicketModalData) => d.category === 'billing')
  @ModalInput({ label: 'Invoice / Order ID', placeholder: 'e.g. INV-0042' })
  invoiceId!: string;
}
