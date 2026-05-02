import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  InteractionContextType,
  type RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord.js';
import type { ContextMenuRegistry } from './context-menu.registry';

export class ContextMenuRegistrar {
  constructor(private readonly registry: ContextMenuRegistry) {}

  /**
   * Build the REST payloads for every registered context menu command.
   *
   * The payloads are merged with the slash command payloads at registration
   * time inside `SlashRegistrar.register()`; Discord exposes a single
   * application-commands endpoint for all command types.
   */
  public buildPayloads(): Array<RESTPostAPIContextMenuApplicationCommandsJSONBody> {
    const payloads: Array<RESTPostAPIContextMenuApplicationCommandsJSONBody> = [];

    for (const [, resolved] of this.registry.allCommands()) {
      const builder = new ContextMenuCommandBuilder()
        .setName(resolved.config.name)
        .setType(
          resolved.config.type === 'user' ? ApplicationCommandType.User : ApplicationCommandType.Message,
        );

      if (resolved.config.dmPermission !== undefined) {
        builder.setContexts(
          resolved.config.dmPermission
            ? [
                InteractionContextType.Guild,
                InteractionContextType.BotDM,
                InteractionContextType.PrivateChannel,
              ]
            : [InteractionContextType.Guild],
        );
      }
      if (resolved.config.defaultMemberPermissions !== undefined) {
        builder.setDefaultMemberPermissions(resolved.config.defaultMemberPermissions);
      }

      payloads.push(builder.toJSON() as RESTPostAPIContextMenuApplicationCommandsJSONBody);
    }

    return payloads;
  }
}
