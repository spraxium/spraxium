export type { ModuleMetadata } from './module-metadata.interface';
export type { SpraxiumOnBoot, SpraxiumOnReady, SpraxiumOnShutdown } from './lifecycle.interface';
export type { ExecutionContext } from './execution-context.interface';
export type { SpraxiumGuard } from './spraxium-guard.interface';
export type { GuardEntry } from './guard-entry.interface';
export type { GuardOptionConfig } from './guard-option-config.interface';

export type { PrefixCommandConfig } from './prefix-command-config.interface';
export type { PrefixCommandHandlerMetadata } from './prefix-command-handler-metadata.interface';
export type {
  PrefixArgType,
  PrefixArgValidation,
  PrefixArgMetadata,
  PrefixArgDefinition,
} from './prefix-arg-metadata.interface';
export type { PrefixConfig } from './prefix-config.interface';
export type { PrefixSubcommandConfig } from './prefix-subcommand-config.interface';
export type { PrefixGuildEntry, PrefixGuildProvider } from './prefix-guild.interface';

export type { SlashCommandConfig } from './slash-command-config.interface';
export type { SlashCommandHandlerMetadata } from './slash-command-handler-metadata.interface';
export type {
  SlashOptionType,
  SlashOptionChoice,
  GuildChannelType,
  SlashBaseOptionConfig,
  SlashStringOptionConfig,
  SlashIntegerOptionConfig,
  SlashNumberOptionConfig,
  SlashChannelOptionConfig,
  SlashOptionMetadata,
} from './slash-option-metadata.interface';
export type {
  SlashSubcommandMetadata,
  SlashSubcommandGroupMetadata,
} from './slash-subcommand-metadata.interface';
export type { SlashAutocompleteHandlerMetadata } from './slash-autocomplete-handler-metadata.interface';
