import { SlashCommand } from '@spraxium/common';

@SlashCommand({
  name: 'info',
  description: 'Show bot information.',
  i18n: { name: 'commands.info.name', description: 'commands.info.description' },
})
export class InfoCommand {
  build() {}
}
