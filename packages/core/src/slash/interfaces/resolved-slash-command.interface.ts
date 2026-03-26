import type { Constructor, SlashCommandConfig } from '@spraxium/common';

export interface ResolvedSlashCommand {
  config: SlashCommandConfig;
  ctor: Constructor;
}
