import type { SchematicInterface } from '../interfaces';

export class BootServiceSchematic implements SchematicInterface {
  readonly name = 'boot-service';
  readonly aliases = ['bs'] as const;
  readonly description = 'Generate a service with onBoot/onShutdown lifecycle hooks';
  readonly fileSuffix = 'service';
  readonly moduleArray = 'providers';

  render(pascalName: string): string {
    return `import { Injectable } from '@spraxium/common';
import type { SpraxiumOnBoot, SpraxiumOnShutdown } from '@spraxium/common';
import { Logger } from '@spraxium/core';

@Injectable()
export class ${pascalName}Service implements SpraxiumOnBoot, SpraxiumOnShutdown {
  private readonly logger = new Logger(${pascalName}Service.name);

  async onBoot(): Promise<void> {
    this.logger.info('${pascalName}Service booted');
  }

  async onShutdown(): Promise<void> {
    this.logger.info('${pascalName}Service shutting down');
  }
}
`;
  }
}
