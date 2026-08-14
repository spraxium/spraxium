import type { MessageFlags } from 'discord.js';

export type ErrorReplyOptions =
  | { content: string; embeds?: never; flags?: MessageFlags.Ephemeral }
  | { embeds: Array<object>; content?: never; flags?: MessageFlags.Ephemeral };
