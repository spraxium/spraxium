import { DynamicButton } from '@spraxium/components';
import type { ButtonRenderConfig } from '@spraxium/components';
import type { Player } from '../leaderboard.data';

@DynamicButton({ baseId: 'lb-player', payloadTtl: 600 })
export class PlayerButton {
  static render(player: Player): ButtonRenderConfig {
    return {
      label: player.name,
      style: 'secondary',
      emoji: '👤',
    };
  }
}
