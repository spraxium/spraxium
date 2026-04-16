import { SlashCommand, SlashOption, SlashSubcommand } from '@spraxium/common';
import { PermissionFlagsBits } from 'discord.js';

// Moderation command that showcases:
//   - defaultMemberPermissions: Discord hides the command from members without ManageMessages
//   - @UseGuards on handlers for runtime enforcement (GuildOnly, PermissionGuard, CooldownGuard)

@SlashCommand({
  name: 'mod',
  description: 'Moderation commands.',
  defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
})
export class ModCommand {
  @SlashOption.User('target', { description: 'Member to warn', required: true })
  @SlashOption.String('reason', { description: 'Reason for the warning', required: false, maxLength: 512 })
  @SlashSubcommand({ name: 'warn', description: 'Send a formal warning to a member' })
  warn() {}

  @SlashOption.User('target', { description: 'Member to kick', required: true })
  @SlashOption.String('reason', { description: 'Reason for kicking', required: false, maxLength: 512 })
  @SlashSubcommand({ name: 'kick', description: 'Kick a member from the server' })
  kick() {}

  @SlashOption.User('target', { description: 'Member to time out', required: true })
  @SlashOption.Integer('duration', {
    description: 'Time-out duration',
    required: true,
    choices: [
      { name: '5 minutes', value: 5 },
      { name: '30 minutes', value: 30 },
      { name: '1 hour', value: 60 },
      { name: '1 day', value: 1440 },
    ],
  })
  @SlashSubcommand({ name: 'timeout', description: 'Time out a member' })
  timeout() {}
}
