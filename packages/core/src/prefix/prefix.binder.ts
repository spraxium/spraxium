import type { PrefixArgMetadata, PrefixConfig } from '@spraxium/common';
import { logger } from '@spraxium/logger';
import type { Client, Message } from 'discord.js';
import { ConfigStore } from '../config';
import { SpraxiumExecutionContext } from '../context';
import { CommandNotFoundException, ExceptionHandler } from '../exceptions';
import { PREFIX_MESSAGES } from './constants';
import type { PrefixGuildManager } from './guild';
import { PrefixInvoker } from './prefix.invoker';
import { PrefixParser } from './prefix.parser';
import type { PrefixRegistry } from './prefix.registry';

export class PrefixBinder {
  private readonly log = logger.child('PrefixBinder');
  private readonly boundClients = new WeakSet<Client>();
  private readonly parser = new PrefixParser();
  private readonly invoker = new PrefixInvoker();

  constructor(private readonly registry: PrefixRegistry) {}

  public bind(client: Client, config: PrefixConfig, guildManager: PrefixGuildManager): void {
    if (this.registry.size === 0 || this.boundClients.has(client)) return;
    this.boundClients.add(client);
    this.parser.setClientId(client);

    client.on('messageCreate', (message: Message) => {
      void this.handleMessage(message, config, guildManager);
    });

    this.log.debug(PREFIX_MESSAGES.binderBound(this.registry.size));
  }

  public get cooldowns(): PrefixBinder['invoker']['cooldowns'] {
    return this.invoker.cooldowns;
  }

  private async handleMessage(
    message: Message,
    config: PrefixConfig,
    guildManager: PrefixGuildManager,
  ): Promise<void> {
    if (message.author.bot) return;

    const parsed = this.parser.parse(message, config, guildManager);
    if (!parsed) return;

    const command = this.registry.findCommand(parsed.commandName);
    if (!command) {
      if (config.replyOnNotFound) {
        const ctx = new SpraxiumExecutionContext(message, parsed.commandName);
        await ExceptionHandler.handle(
          new CommandNotFoundException({ command: parsed.commandName, prefix: parsed.prefix }),
          ctx,
          ConfigStore.getRaw().exceptions,
        );
      }
      return;
    }

    let subcommand: string | undefined;
    let argv = parsed.argv;
    let argMetas: Array<PrefixArgMetadata>;

    if (argv.length > 0 && this.registry.isSubcommand(command, argv[0])) {
      subcommand = argv[0].toLowerCase();
      argv = argv.slice(1);
      argMetas = this.registry.resolveArgs(command, subcommand);
    } else {
      argMetas = command.args;
    }

    const handler = this.registry.findHandler(command, subcommand);
    if (!handler) {
      if (config.replyOnNotFound) {
        const ctx = new SpraxiumExecutionContext(message, command.config.name);
        await ExceptionHandler.handle(
          new CommandNotFoundException({
            command: subcommand ? `${command.config.name} ${subcommand}` : command.config.name,
            prefix: parsed.prefix,
          }),
          ctx,
          ConfigStore.getRaw().exceptions,
        );
      }
      return;
    }

    await this.invoker.run(handler, message, argv, config, argMetas);
  }
}
