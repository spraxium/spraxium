import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import type {
  Constructor,
  ContextMenuCommandConfig,
  ContextMenuCommandHandlerMetadata,
} from '@spraxium/common';
import type {
  ResolvedContextMenuCommand,
  ResolvedContextMenuEntry,
  ResolvedContextMenuHandler,
} from './interfaces';

function indexKey(name: string, type: ContextMenuCommandConfig['type']): string {
  return `${type}:${name.toLowerCase()}`;
}

export class ContextMenuRegistry {
  private readonly commands = new Map<Constructor, ResolvedContextMenuCommand>();
  private readonly handlers: Array<ResolvedContextMenuHandler> = [];
  private readonly handlerIndex = new Map<string, ResolvedContextMenuHandler>();

  public registerCommand(ctor: Constructor): void {
    const config = Reflect.getOwnMetadata(METADATA_KEYS.CONTEXT_MENU_COMMAND, ctor) as
      | ContextMenuCommandConfig
      | undefined;
    if (!config) return;

    this.commands.set(ctor, { config, ctor });
  }

  public registerHandler(ctor: Constructor, instance: unknown): void {
    const meta = Reflect.getOwnMetadata(METADATA_KEYS.CONTEXT_MENU_COMMAND_HANDLER, ctor) as
      | ContextMenuCommandHandlerMetadata
      | undefined;
    if (!meta) return;

    const command = this.commands.get(meta.command as Constructor);
    if (!command) return;

    const resolved: ResolvedContextMenuHandler = {
      handlerCtor: ctor,
      instance,
      meta,
      commandCtor: meta.command as Constructor,
      config: command.config,
    };

    this.handlers.push(resolved);
    this.handlerIndex.set(indexKey(command.config.name, command.config.type), resolved);
  }

  public findHandler(
    commandName: string,
    type: ContextMenuCommandConfig['type'],
  ): ResolvedContextMenuHandler | undefined {
    return this.handlerIndex.get(indexKey(commandName, type));
  }

  public allCommands(): ReadonlyMap<Constructor, ResolvedContextMenuCommand> {
    return this.commands;
  }

  public getResolved(): Array<ResolvedContextMenuEntry> {
    return this.handlers.map((h) => ({
      commandName: h.config.name,
      type: h.config.type,
      handlerClass: h.handlerCtor.name,
    }));
  }

  public get size(): number {
    return this.handlers.length;
  }

  public get commandCount(): number {
    return this.commands.size;
  }
}
