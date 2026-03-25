import type { PrefixArgMetadata } from '@spraxium/common';

/** Resolved metadata for a single subcommand declared via @PrefixSubcommand(). */
export interface PrefixSubcommandEntry {
  name: string;
  description: string;
  args: Array<PrefixArgMetadata>;
}
