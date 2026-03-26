import type { PrefixArgMetadata } from '@spraxium/common';
import type { PrefixSubcommandInfo } from './prefix-subcommand-info.interface';

/** Structured command info for help rendering. */
export interface PrefixCommandInfo {
  name: string;
  aliases: Array<string>;
  description: string;
  category: string;
  usage: string;
  cooldown: number;
  args: Array<PrefixArgMetadata>;
  subcommands: Array<PrefixSubcommandInfo>;
}
