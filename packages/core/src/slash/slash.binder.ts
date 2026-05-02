import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import { logger } from '@spraxium/logger';
import type { Client, Interaction } from 'discord.js';
import { ConfigStore } from '../config';
import { SpraxiumExecutionContext } from '../context';
import { ExceptionHandler } from '../exceptions';
import type { ResolvedAutocompleteHandler } from './interfaces';
import { SlashInvoker } from './slash.invoker';
import type { SlashRegistry } from './slash.registry';

export class SlashBinder {
  private readonly log = logger.child('SlashBinder');
  private readonly boundClients = new WeakSet<Client>();
  private readonly invoker = new SlashInvoker();

  constructor(private readonly registry: SlashRegistry) {}

  public bind(client: Client): void {
    if (this.registry.size === 0 || this.boundClients.has(client)) return;
    this.boundClients.add(client);

    client.on('interactionCreate', (interaction: Interaction) => {
      void this.handleInteraction(interaction);
    });

    this.log.debug(`Slash binder bound , ${this.registry.size} handler(s)`);
  }

  private async handleInteraction(interaction: Interaction): Promise<void> {
    if (interaction.isAutocomplete()) {
      await this.handleAutocomplete(interaction);
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const commandName = interaction.commandName;
    const sub = interaction.options.getSubcommand(false) ?? undefined;
    const group = interaction.options.getSubcommandGroup(false) ?? undefined;

    const handler = this.registry.findHandler(commandName, sub, group);
    if (!handler) return;

    await this.invoker.run(handler, interaction);
  }

  private async handleAutocomplete(interaction: Interaction): Promise<void> {
    if (!interaction.isAutocomplete()) return;

    const commandName = interaction.commandName;
    const focused = interaction.options.getFocused(true);

    const autocomplete = this.registry.findAutocomplete(commandName, focused.name);
    if (!autocomplete) {
      await interaction.respond([]);
      return;
    }

    try {
      const proto = autocomplete.handlerCtor.prototype as object;
      const focusedIndex: number | undefined = Reflect.getOwnMetadata(
        METADATA_KEYS.SLASH_FOCUSED_PARAM,
        proto,
        'handle',
      );
      const ctxIndex: number | undefined = Reflect.getOwnMetadata(METADATA_KEYS.CTX_PARAM, proto, 'handle');

      const params = this.buildAutocompleteParams(
        autocomplete,
        focusedIndex,
        ctxIndex,
        focused.value,
        interaction,
      );
      const fn = (autocomplete.instance as Record<string, unknown>).handle;
      if (typeof fn === 'function') {
        await Promise.resolve(
          (fn as (...args: Array<unknown>) => unknown).call(autocomplete.instance, ...params),
        );
      }
    } catch (err) {
      const ctx = new SpraxiumExecutionContext(interaction, commandName);
      await ExceptionHandler.handle(err, ctx, ConfigStore.getRaw().exceptions);
    }
  }

  private buildAutocompleteParams(
    _handler: ResolvedAutocompleteHandler,
    focusedIndex: number | undefined,
    ctxIndex: number | undefined,
    focusedValue: string | number,
    interaction: Interaction,
  ): Array<unknown> {
    const maxIndex = Math.max(
      focusedIndex !== undefined ? focusedIndex + 1 : 0,
      ctxIndex !== undefined ? ctxIndex + 1 : 0,
    );

    const params: Array<unknown> = [];
    for (let i = 0; i < maxIndex; i++) {
      if (i === focusedIndex) {
        params.push(focusedValue);
      } else if (i === ctxIndex) {
        params.push(interaction);
      } else {
        params.push(undefined);
      }
    }

    return params;
  }
}
