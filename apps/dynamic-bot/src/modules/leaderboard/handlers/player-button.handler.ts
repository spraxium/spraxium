import { Ctx } from '@spraxium/common';
import { ButtonPayload, DynamicButtonHandler } from '@spraxium/components';
import { type ButtonInteraction, MessageFlags } from 'discord.js';
import { PlayerButton } from '../components/player-button.component';
import type { Player } from '../leaderboard.data';

@DynamicButtonHandler(PlayerButton)
export class PlayerButtonHandler {
  async handle(@Ctx() interaction: ButtonInteraction, @ButtonPayload() player: Player): Promise<void> {
    await interaction.reply({
      content: [
        `### 👤 ${player.name}`,
        `Score: **${player.score.toLocaleString()}**`,
        `Player ID: \`${player.id}\``,
      ].join('\n'),
      flags: MessageFlags.Ephemeral,
    });
  }
}
