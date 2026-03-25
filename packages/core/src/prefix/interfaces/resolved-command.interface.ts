import type { Constructor, PrefixArgMetadata, PrefixCommandConfig } from '@spraxium/common';
import type { PrefixSubcommandEntry } from './subcommand-entry.interface';

/** A fully resolved command registration combining class + decorator metadata. */
export interface ResolvedPrefixCommand {
  ctor: Constructor;
  config: PrefixCommandConfig;
  /** Root-level arguments (from `build()` decorators). Empty for subcommand-based commands. */
  args: Array<PrefixArgMetadata>;
  /** Subcommand definitions (from `@PrefixSubcommand()` methods). */
  subcommands: Array<PrefixSubcommandEntry>;
}
