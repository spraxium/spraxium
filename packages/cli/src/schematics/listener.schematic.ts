import type { ISchematic } from '../interfaces';

export class ListenerSchematic implements ISchematic {
  readonly name = 'listener';
  readonly aliases = ['l'] as const;
  readonly description = 'Generate a @Listener() event listener class';
  readonly fileSuffix = 'listener';
  readonly moduleArray = 'listeners';

  render(pascalName: string): string {
    return `import { Events, Listener, On } from '@spraxium/common';
import type { Message } from 'discord.js';

@Listener(Events.MessageCreate)
export class ${pascalName}Listener {
  @On()
  async onMessage(message: Message): Promise<void> {
    if (message.author.bot) return;
    // TODO: implement listener logic
  }
}
`;
  }
}
