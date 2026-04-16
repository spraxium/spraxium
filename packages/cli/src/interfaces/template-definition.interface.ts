export interface TemplateDefinition {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly extraPackages: ReadonlyArray<string>;
}
