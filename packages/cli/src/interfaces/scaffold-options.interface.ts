import type { ExtraPackage } from './extra-package.interface';

export interface ScaffoldOptions {
  readonly dir: string;
  readonly name: string;
  readonly description: string;
  readonly template: string;
  readonly extras: ReadonlyArray<ExtraPackage>;
  readonly monorepoRoot: string | null;
}
