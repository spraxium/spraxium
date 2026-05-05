import { Logger } from './logger.service';

export class CommandLogger {
  // Lazy-initialized to avoid a circular import with `logger.service.ts`.
  // Instantiating `new Logger(...)` at class-eval time would throw when the
  // module graph is still being resolved (CommandLogger is imported BY
  // Logger to wire `commandLogging`).
  private static logger: Logger | undefined;

  /**
   * Bind interaction logging to a discord.js Client.
   * The client is typed as `unknown` to avoid a hard dependency on discord.js.
   */
  static bind(client: unknown): void {
    if (!CommandLogger.logger) {
      CommandLogger.logger = new Logger('CommandLogger');
    }
    const log = CommandLogger.logger;
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
