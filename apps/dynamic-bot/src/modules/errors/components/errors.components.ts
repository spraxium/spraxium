import { Button } from '@spraxium/components';

@Button({ customId: 'errors-boom', label: 'Crash me', style: 'danger', emoji: '💥' })
export class BoomButton {}

@Button({ customId: 'errors-expired', label: 'Stale payload', style: 'secondary', emoji: '⏱️' })
export class ExpiredButton {}
