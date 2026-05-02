import { Logger } from './logger.service';

export class CommandLogger {
  private static readonly logger = new Logger('CommandLogger');

  /**
   * Bind interaction logging to a discord.js Client.
   * The client is typed as `unknown` to avoid a hard dependency on discord.js.
   */
  static bind(client: unknown): void {
    const c = client as {
      on(event: string, cb: (interaction: unknown) => void): void;
    };

    c.on('interactionCreate', (interaction) => {
      const i = interaction as {
        isChatInputCommand(): boolean;
        commandName: string;
        user: { tag: string; id: string };
        guild: { name: string } | null;
        guildId: string | null;
        channelId: string;
      };

      if (!i.isChatInputCommand()) return;

      const command = i.commandName;
      const user = i.user.tag;
      const userId = i.user.id;
      const guild = i.guild?.name ?? 'DM';
      const guildId = i.guildId ?? 'N/A';
      const channel = i.channelId;

      CommandLogger.logger.log('command', `/${command} by ${user} in ${guild} (${guildId})`, {
        command,
        user,
        userId,
        guild,
        guildId,
        channel,
      });
    });
  }
}
