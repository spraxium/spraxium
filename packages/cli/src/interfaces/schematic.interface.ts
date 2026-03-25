export interface SchematicInterface {
  readonly name: string;
  readonly aliases: readonly string[];
  readonly description: string;
  readonly fileSuffix: string;
  readonly moduleArray: string;
  render(pascalName: string, kebabName: string): string;
}
