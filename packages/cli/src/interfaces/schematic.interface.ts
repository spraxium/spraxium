export interface ISchematic {
  readonly name: string;
  readonly aliases: ReadonlyArray<string>;
  readonly description: string;
  readonly fileSuffix: string;
  readonly moduleArray: string;
  render(pascalName: string, kebabName: string): string;
}
