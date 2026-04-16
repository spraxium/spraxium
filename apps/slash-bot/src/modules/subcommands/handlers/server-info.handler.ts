import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { type ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { ServerCommand } from '../commands/server.command';

@SlashCommandHandler(ServerCommand, { sub: 'info' })
export class ServerInfoHandler {
  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: '❌ Use this command inside a server.', flags: 'Ephemeral' });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL())
      .setColor(0x5865f2)
      .addFields(
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Members', value: String(guild.memberCount), inline: true },
        { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
      );

    await interaction.reply({ embeds: [embed] });
  }
}
