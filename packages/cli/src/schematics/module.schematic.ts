import type { Schematic } from '../interfaces';

export class ModuleSchematic implements Schematic {
  readonly name = 'module';
  readonly aliases = ['m'] as const;
  readonly description = 'Generate a @Module() class';
  readonly fileSuffix = 'module';
  readonly moduleArray = '';

  render(pascalName: string): string {
    return `import { Module } from '@spraxium/common';

@Module({
  imports: [],
  providers: [],
  listeners: [],
})
export class ${pascalName}Module {}
`;
  }
}
