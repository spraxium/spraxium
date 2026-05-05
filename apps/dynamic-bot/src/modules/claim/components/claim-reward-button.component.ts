import { DynamicButton } from '@spraxium/components';
import type { ButtonRenderConfig } from '@spraxium/components';
import type { Reward } from '../claim.data';

/**
 * One-shot reward button. The handler calls `ref.consume()` immediately after
 * the first click: any subsequent click receives a "payload expired" response.
 */
@DynamicButton({ baseId: 'claim-reward', payloadTtl: 120 })
export class ClaimRewardButton {
  static render(reward: Reward): ButtonRenderConfig {
    return {
      label: `Claim ${reward.amount} ${reward.prize}`,
      style: 'success',
      emoji: '🎁',
    };
  }
}
