import { Button } from '@spraxium/components';

/**
 * A button that is only rendered inside the VIP panel reply.
 * The button handler also carries @UseGuards, so even if someone
 * somehow replays the customId, the guard fires again on click.
 */
@Button({ customId: 'btn_vip_claim', label: 'Claim VIP Perk', style: 'primary', emoji: '👑' })
export class VipClaimButton {}
