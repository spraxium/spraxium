export interface DatabaseTemplateOptions {
  readonly orm: string;
  readonly db: string;
  readonly moduleName: string;
  readonly pascalName: string;
  readonly srcDir: string;
  readonly projectRoot: string;
  readonly monorepoRoot: string | null;
}
