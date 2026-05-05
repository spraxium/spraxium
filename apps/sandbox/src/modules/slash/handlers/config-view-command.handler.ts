import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { Logger } from '@spraxium/logger';
import { EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { ConfigCommand } from '../commands/config.command';

@SlashCommandHandler(ConfigCommand, { sub: 'view' })
export class ConfigViewHandler {
  private readonly logger = new Logger(ConfigViewHandler.name);

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    this.logger.debug(`Config view requested by ${interaction.user.tag}`);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('⚙️ Server Configuration')
      .addFields(
        { name: 'Prefix', value: '`!`', inline: true },
        { name: 'Language', value: 'en-US', inline: true },
        { name: 'Automod', value: 'Enabled', inline: true },
        { name: 'Welcome Channel', value: '#welcome', inline: true },
      )
      .setFooter({ text: 'Use /config to modify settings.' });

    await interaction.reply({ embeds: [embed] });
  }
}
