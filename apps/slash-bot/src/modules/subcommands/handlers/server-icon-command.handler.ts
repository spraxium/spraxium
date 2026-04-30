import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { type ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { ServerCommand } from '../commands/server.command';

@SlashCommandHandler(ServerCommand, { sub: 'icon' })
export class ServerIconHandler {
  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild;
    const iconUrl = guild?.iconURL({ size: 512 });

    if (!iconUrl) {
      await interaction.reply({ content: '❌ This server has no icon.', flags: 'Ephemeral' });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${guild.name} — Server Icon`)
      .setImage(iconUrl)
      .setColor(0x5865f2);

    await interaction.reply({ embeds: [embed] });
  }
}
