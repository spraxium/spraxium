import type { SchematicInterface } from '../interfaces';

export class TaskSchematic implements SchematicInterface {
  readonly name = 'task';
  readonly aliases = ['t'] as const;
  readonly description = 'Generate a scheduled task service with @Cron()';
  readonly fileSuffix = 'task';
  readonly moduleArray = 'providers';

  render(pascalName: string): string {
    return `import { Injectable } from '@spraxium/common';
import { Cron, CronExpression } from '@spraxium/schedule';

@Injectable()
export class ${pascalName}Task {
  @Cron(CronExpression.EVERY_HOUR)
  async execute(): Promise<void> {
    // TODO: implement scheduled task
  }
}
`;
  }
}
