import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import type { Constructor, SlashOptionMetadata } from '@spraxium/common';
import type { ResolvedSlashHandler } from '../interfaces';
import type { SubcommandListEntry } from '../types';

export function resolveOptionsFromCommand(handler: ResolvedSlashHandler): Array<SlashOptionMetadata> {
  const { commandCtor, meta } = handler;

  if (!meta.sub) {
    return Reflect.getMetadata(METADATA_KEYS.SLASH_OPTION, commandCtor.prototype, 'build') ?? [];
  }

  if (!meta.group) {
    const subs: Array<SubcommandListEntry> =
      Reflect.getMetadata(METADATA_KEYS.SLASH_SUBCOMMANDS_LIST, commandCtor) ?? [];
    const entry = subs.find((s) => s.meta.name === meta.sub);
    if (!entry) return [];
    return Reflect.getMetadata(METADATA_KEYS.SLASH_OPTION, commandCtor.prototype, entry.method) ?? [];
  }

  const groupClasses: Array<Constructor> =
    Reflect.getMetadata(METADATA_KEYS.SLASH_SUBCOMMAND_GROUPS, commandCtor) ?? [];

  for (const groupClass of groupClasses) {
    const groupMeta = Reflect.getOwnMetadata(METADATA_KEYS.SLASH_SUBCOMMAND_GROUP, groupClass) as
      | { name: string }
      | undefined;
    if (groupMeta?.name !== meta.group) continue;

    const groupSubs: Array<SubcommandListEntry> =
      Reflect.getMetadata(METADATA_KEYS.SLASH_SUBCOMMANDS_LIST, groupClass) ?? [];
    const entry = groupSubs.find((s) => s.meta.name === meta.sub);
    if (!entry) return [];
    return Reflect.getMetadata(METADATA_KEYS.SLASH_OPTION, groupClass.prototype, entry.method) ?? [];
  }

  return [];
}
