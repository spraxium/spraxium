export interface SlashCommandHandlerMetadata {
  command: new () => object;
  sub?: string;
  group?: string;
}
