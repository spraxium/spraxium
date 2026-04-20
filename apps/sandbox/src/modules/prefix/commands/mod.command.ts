import { PrefixArg, PrefixCommand, PrefixSubcommand } from '@spraxium/common';

@PrefixCommand({
  name: 'mod',
  aliases: ['m', 'moderation'],
  description: 'Moderation commands.',
  category: 'Moderation',
  usage: '!mod <warn|kick|ban> <user> [reason]',
})
export class ModCommand {
  @PrefixSubcommand({ name: 'warn', description: 'Warn a user' })
  @PrefixArg.User('target')
  @PrefixArg.Rest('reason', { required: false })
  warn() {}

  @PrefixSubcommand({ name: 'kick', description: 'Kick a user' })
  @PrefixArg.User('target')
  @PrefixArg.Rest('reason', { required: false })
  kick() {}

  @PrefixSubcommand({ name: 'ban', description: 'Ban a user' })
  @PrefixArg.User('target')
  @PrefixArg.Rest('reason', { required: false })
  ban() {}
}
