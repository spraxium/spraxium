import type { Constructor, SlashCommandConfig, SlashCommandHandlerMetadata } from '@spraxium/common';

export interface ResolvedSlashHandler {
  handlerCtor: Constructor;
  instance: unknown;
  meta: SlashCommandHandlerMetadata;
  commandCtor: Constructor;
  config: SlashCommandConfig;
}
