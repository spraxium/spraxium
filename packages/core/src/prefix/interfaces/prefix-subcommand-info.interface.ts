import type { PrefixArgMetadata } from '@spraxium/common';

/** Structured info for a single prefix subcommand, used in help rendering. */
export interface PrefixSubcommandInfo {
  name: string;
  description: string;
  handlerClass: string;
  args: Array<PrefixArgMetadata>;
}
