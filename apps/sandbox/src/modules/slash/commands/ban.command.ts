import { SlashCommand, SlashOption } from '@spraxium/common';
import { PermissionFlagsBits } from 'discord.js';

@SlashCommand({
  name: 'ban',
  description: 'Ban a member from the server.',
  defaultMemberPermissions: PermissionFlagsBits.BanMembers,
})
export class BanCommand {
  @SlashOption.User('target', { description: 'The member to ban', required: true })
  @SlashOption.String('reason', { description: 'Reason for the ban', required: false, maxLength: 512 })
  @SlashOption.Integer('days', {
    description: 'Number of days of messages to delete',
    required: false,
    min: 0,
    max: 7,
  })
  build() {}
}
