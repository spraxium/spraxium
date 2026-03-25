/** Result of parsing a raw message into command parts. */
export interface ParsedPrefixMessage {
  /** The detected prefix string. */
  prefix: string;
  /** The command name (lowercased unless caseSensitive). */
  commandName: string;
  /** Raw argv tokens after the command name. */
  argv: Array<string>;
}
