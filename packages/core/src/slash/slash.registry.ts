import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import type {
  Constructor,
  SlashAutocompleteHandlerMetadata,
  SlashCommandConfig,
  SlashCommandHandlerMetadata,
} from '@spraxium/common';
import { resolveOptionsFromCommand } from './helpers';
import type {
  ResolvedAutocompleteHandler,
  ResolvedSlashCommand,
  ResolvedSlashEntry,
  ResolvedSlashHandler,
} from './interfaces';

export class SlashRegistry {
  private readonly commands = new Map<Constructor, ResolvedSlashCommand>();
  private readonly nameIndex = new Map<string, Constructor>();
  private readonly handlers: Array<ResolvedSlashHandler> = [];
  private readonly autocompleteHandlers = new Map<string, ResolvedAutocompleteHandler>();

  public registerCommand(ctor: Constructor): void {
    const config = Reflect.getOwnMetadata(METADATA_KEYS.SLASH_COMMAND, ctor) as
      | SlashCommandConfig
      | undefined;
    if (!config) return;

    const resolved: ResolvedSlashCommand = { config, ctor };
    this.commands.set(ctor, resolved);
    this.nameIndex.set(config.name.toLowerCase(), ctor);
  }

  public registerHandler(ctor: Constructor, instance: unknown): void {
    const meta = Reflect.getOwnMetadata(METADATA_KEYS.SLASH_COMMAND_HANDLER, ctor) as
      | SlashCommandHandlerMetadata
      | undefined;
    if (!meta) return;

    const command = this.commands.get(meta.command as Constructor);
    if (!command) return;

    this.handlers.push({
      handlerCtor: ctor,
      instance,
      meta,
      commandCtor: meta.command as Constructor,
      config: command.config,
    });
  }

  public registerAutocompleteHandler(ctor: Constructor, instance: unknown): void {
    const meta = Reflect.getOwnMetadata(METADATA_KEYS.SLASH_AUTOCOMPLETE_HANDLER, ctor) as
      | SlashAutocompleteHandlerMetadata
      | undefined;
    if (!meta) return;

    const command = this.commands.get(meta.command as Constructor);
    if (!command) return;

    const key = `${command.config.name.toLowerCase()}:${meta.optionName}`;
    this.autocompleteHandlers.set(key, {
      commandName: command.config.name,
      optionName: meta.optionName,
      instance,
      handlerCtor: ctor as new (...args: unknown[]) => unknown,
    });
  }

  public findHandler(commandName: string, sub?: string, group?: string): ResolvedSlashHandler | undefined {
    const name = commandName.toLowerCase();
    return this.handlers.find(
      (h) => h.config.name.toLowerCase() === name && h.meta.sub === sub && h.meta.group === group,
    );
  }

  public findAutocomplete(commandName: string, optionName: string): ResolvedAutocompleteHandler | undefined {
    return this.autocompleteHandlers.get(`${commandName.toLowerCase()}:${optionName}`);
  }

  public allCommands(): ReadonlyMap<Constructor, ResolvedSlashCommand> {
    return this.commands;
  }

  public allHandlers(): ReadonlyArray<ResolvedSlashHandler> {
    return this.handlers;
  }

  public getResolved(): Array<ResolvedSlashEntry> {
    return this.handlers.map((h) => ({
      commandName: h.config.name,
      handlerClass: h.handlerCtor.name,
      sub: h.meta.sub,
      group: h.meta.group,
      optionCount: resolveOptionsFromCommand(h).length,
    }));
  }

  public get size(): number {
    return this.handlers.length;
  }

  public get commandCount(): number {
    return this.commands.size;
  }
}
