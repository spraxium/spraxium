import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import type {
  Constructor,
  PrefixArgDefinition,
  PrefixArgMetadata,
  PrefixCommandConfig,
  PrefixCommandHandlerMetadata,
  PrefixSubcommandConfig,
} from '@spraxium/common';
import type {
  PrefixCommandInfo,
  PrefixSubcommandEntry,
  ResolvedPrefixCommand,
  ResolvedPrefixEntry,
  ResolvedPrefixHandler,
} from './interfaces';

export class PrefixRegistry {
  private readonly commands = new Map<Constructor, ResolvedPrefixCommand>();
  private readonly nameIndex = new Map<string, Constructor>();
  private readonly handlers: Array<ResolvedPrefixHandler> = [];

  public registerCommand(ctor: Constructor): void {
    const config = Reflect.getOwnMetadata(METADATA_KEYS.PREFIX_COMMAND, ctor) as
      | PrefixCommandConfig
      | undefined;
    if (!config) return;

    const proto = ctor.prototype as Record<string, unknown>;
    const subcommands = this.collectSubcommands(proto);

    let args: Array<PrefixArgMetadata> = [];
    if (subcommands.length === 0 && typeof proto.build === 'function') {
      const definitions: Array<PrefixArgDefinition> =
        Reflect.getOwnMetadata(METADATA_KEYS.PREFIX_ARG, proto, 'build') ?? [];
      args = PrefixRegistry.resolveDefinitions(definitions);
    }

    const resolved: ResolvedPrefixCommand = { ctor, config, args, subcommands };
    this.commands.set(ctor, resolved);

    const name = config.name.toLowerCase();
    this.nameIndex.set(name, ctor);
    for (const alias of config.aliases ?? []) {
      this.nameIndex.set(alias.toLowerCase(), ctor);
    }
  }

  public registerHandler(ctor: Constructor, instance: unknown): void {
    const meta = Reflect.getOwnMetadata(METADATA_KEYS.PREFIX_COMMAND_HANDLER, ctor) as
      | PrefixCommandHandlerMetadata
      | undefined;
    if (!meta) return;

    const command = this.commands.get(meta.command as Constructor);
    if (!command) return;

    this.handlers.push({
      handlerCtor: ctor,
      instance,
      meta,
      command,
    });
  }

  public findCommand(nameOrAlias: string): ResolvedPrefixCommand | undefined {
    const ctor = this.nameIndex.get(nameOrAlias.toLowerCase());
    return ctor ? this.commands.get(ctor) : undefined;
  }

  public findHandler(
    command: ResolvedPrefixCommand,
    subcommand: string | undefined,
  ): ResolvedPrefixHandler | undefined {
    const subMatch = subcommand
      ? this.handlers.find((h) => h.command === command && h.meta.subcommand === subcommand)
      : undefined;
    if (subMatch) return subMatch;

    return this.handlers.find((h) => h.command === command && h.meta.subcommand === undefined);
  }

  public resolveArgs(
    command: ResolvedPrefixCommand,
    subcommand: string | undefined,
  ): Array<PrefixArgMetadata> {
    if (subcommand) {
      const sub = command.subcommands.find((s) => s.name.toLowerCase() === subcommand.toLowerCase());
      return sub?.args ?? [];
    }
    return command.args;
  }

  public isSubcommand(command: ResolvedPrefixCommand, name: string): boolean {
    return command.subcommands.some((s) => s.name.toLowerCase() === name.toLowerCase());
  }

  public allHandlers(): ReadonlyArray<ResolvedPrefixHandler> {
    return this.handlers;
  }

  public getResolved(): Array<ResolvedPrefixEntry> {
    return this.handlers.map((h) => {
      const subDef = h.meta.subcommand
        ? h.command.subcommands.find((s) => s.name === h.meta.subcommand)
        : undefined;
      const argCount = subDef ? subDef.args.length : h.command.args.length;

      return {
        commandName: h.command.config.name,
        aliases: h.command.config.aliases ?? [],
        handlerClass: h.handlerCtor.name,
        subcommand: h.meta.subcommand,
        argCount,
      };
    });
  }

  public getCommandInfo(): Array<PrefixCommandInfo> {
    const infos: Array<PrefixCommandInfo> = [];

    for (const [, command] of this.commands) {
      const subs = command.subcommands.map((sub) => {
        const handler = this.handlers.find((h) => h.command === command && h.meta.subcommand === sub.name);
        return {
          name: sub.name,
          description: sub.description,
          handlerClass: handler?.handlerCtor.name ?? '',
          args: sub.args,
        };
      });

      infos.push({
        name: command.config.name,
        aliases: command.config.aliases ?? [],
        description: command.config.description ?? '',
        category: command.config.category ?? '',
        usage: command.config.usage ?? '',
        cooldown: command.config.cooldown ?? 0,
        args: command.args,
        subcommands: subs,
      });
    }

    return infos;
  }

  public get size(): number {
    return this.handlers.length;
  }

  public get commandCount(): number {
    return this.commands.size;
  }

  private collectSubcommands(proto: Record<string, unknown>): Array<PrefixSubcommandEntry> {
    const entries: Array<PrefixSubcommandEntry> = [];

    for (const key of Object.getOwnPropertyNames(proto)) {
      if (key === 'constructor') continue;

      const subConfig = Reflect.getOwnMetadata(METADATA_KEYS.PREFIX_SUBCOMMAND, proto, key) as
        | PrefixSubcommandConfig
        | undefined;

      if (!subConfig) continue;

      const definitions: Array<PrefixArgDefinition> =
        Reflect.getOwnMetadata(METADATA_KEYS.PREFIX_ARG, proto, key) ?? [];
      const args = PrefixRegistry.resolveDefinitions(definitions);

      entries.push({
        name: subConfig.name,
        description: subConfig.description ?? '',
        args,
      });
    }

    return entries;
  }

  private static resolveDefinitions(definitions: Array<PrefixArgDefinition>): Array<PrefixArgMetadata> {
    return definitions.map((def, index) => ({
      name: def.name,
      type: def.type,
      position: index,
      required: def.required ?? true,
      min: def.min,
      max: def.max,
      minLength: def.minLength,
      maxLength: def.maxLength,
      choices: def.choices,
      validation: def.validation,
    }));
  }
}
