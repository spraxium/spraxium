import type { PrefixArgMetadata } from '@spraxium/common';

/** Structured command info for help rendering. */
export interface PrefixCommandInfo {
  name: string;
  aliases: Array<string>;
  description: string;
  category: string;
  usage: string;
  cooldown: number;
  args: Array<PrefixArgMetadata>;
  subcommands: Array<{
    name: string;
    description: string;
    handlerClass: string;
    args: Array<PrefixArgMetadata>;
  }>;
}
