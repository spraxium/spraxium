import type { ChatInputCommandInteraction, Client } from 'discord.js';
import { Logger } from './logger.service';

export class CommandLogger {
  private static readonly logger = new Logger('CommandLogger');

  static bind(client: Client): void {
    client.on('interactionCreate', (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      CommandLogger.logExecution(interaction);
    });
  }

  private static logExecution(interaction: ChatInputCommandInteraction): void {
    const command = interaction.commandName;
    const user = interaction.user.tag;
    const userId = interaction.user.id;
    const guild = interaction.guild?.name ?? 'DM';
    const guildId = interaction.guildId ?? 'N/A';
    const channel = interaction.channelId;

    CommandLogger.logger.log('command', `/${command} by ${user} in ${guild} (${guildId})`, {
      command,
      user,
      userId,
      guild,
      guildId,
      channel,
    });
  }
}
