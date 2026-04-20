import { PrefixArg, PrefixCommand } from '@spraxium/common';

@PrefixCommand({
  name: 'help',
  aliases: ['h', '?'],
  description: 'Show available commands or detail for a specific command.',
  category: 'Info',
  usage: '!help [command]',
})
export class HelpCommand {
  @PrefixArg.String('command', { required: false })
  build() {}
}
