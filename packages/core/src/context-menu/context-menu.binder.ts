import type { Client, Interaction } from 'discord.js';
import { logger } from '../logger';
import { ContextMenuInvoker } from './context-menu.invoker';
import type { ContextMenuRegistry } from './context-menu.registry';

export class ContextMenuBinder {
  private readonly boundClients = new WeakSet<Client>();
  private readonly invoker = new ContextMenuInvoker();

  constructor(private readonly registry: ContextMenuRegistry) {}

  public bind(client: Client): void {
    if (this.registry.size === 0 || this.boundClients.has(client)) return;
    this.boundClients.add(client);

    client.on('interactionCreate', (interaction: Interaction) => {
      void this.handleInteraction(interaction);
    });

    logger.debug(`Context menu binder bound , ${this.registry.size} handler(s)`);
  }

  private async handleInteraction(interaction: Interaction): Promise<void> {
    if (interaction.isUserContextMenuCommand()) {
      const handler = this.registry.findHandler(interaction.commandName, 'user');
      if (!handler) return;
      await this.invoker.run(handler, interaction);
      return;
    }

    if (interaction.isMessageContextMenuCommand()) {
      const handler = this.registry.findHandler(interaction.commandName, 'message');
      if (!handler) return;
      await this.invoker.run(handler, interaction);
    }
  }
}
