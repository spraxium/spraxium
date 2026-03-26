import type { Schematic } from '../interfaces';

export class ServiceSchematic implements Schematic {
  readonly name = 'service';
  readonly aliases = ['s'] as const;
  readonly description = 'Generate an @Injectable() service class';
  readonly fileSuffix = 'service';
  readonly moduleArray = 'providers';

  render(pascalName: string): string {
    return `import { Injectable } from '@spraxium/common';

@Injectable()
export class ${pascalName}Service {}
`;
  }
}
