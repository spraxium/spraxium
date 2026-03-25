/** Snapshot returned for boot logging / diagnostics. */
export interface ResolvedPrefixEntry {
  commandName: string;
  aliases: Array<string>;
  handlerClass: string;
  subcommand: string | undefined;
  argCount: number;
}
