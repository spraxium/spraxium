import { Button, LinkButton } from '@spraxium/components';

@Button({ customId: 'flow_confirm', label: '✅ Confirm', style: 'success' })
export class FlowConfirmButton {}

@Button({ customId: 'flow_cancel', label: '❌ Cancel', style: 'secondary' })
export class FlowCancelButton {}

@Button({ customId: 'flow_wizard_cancel', label: '✖ Cancel', style: 'secondary' })
export class FlowWizardCancelButton {}

@Button({ customId: 'flow_wizard_submit', label: '📨 Submit', style: 'primary' })
export class FlowWizardSubmitButton {}
