export type ErrorReplyOptions =
  | { content: string; embeds?: never; ephemeral: boolean }
  | { embeds: Array<object>; content?: never; ephemeral: boolean };
