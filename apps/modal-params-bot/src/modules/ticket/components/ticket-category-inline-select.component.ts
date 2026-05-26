import { SelectOption, StringSelect } from '@spraxium/components';

@StringSelect({ customId: 'ticket_category_inline', placeholder: 'Choose a ticket category…' })
@SelectOption({ label: '🐛 Bug Report', value: 'bug_report' })
@SelectOption({ label: '✨ Feature Request', value: 'feature_request' })
@SelectOption({ label: '💳 Billing', value: 'billing' })
export class TicketCategoryInlineSelect {}
