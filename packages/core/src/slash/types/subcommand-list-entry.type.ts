import type { SlashSubcommandMetadata } from '@spraxium/common';

/** A single entry stored in `SLASH_SUBCOMMANDS_LIST` metadata. */
export type SubcommandListEntry = {
  method: string | symbol;
  meta: SlashSubcommandMetadata;
};
