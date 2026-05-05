import { ContextMenuCommandHandler, Ctx } from '@spraxium/common';
import { type UserContextMenuCommandInteraction, time } from 'discord.js';
import { UserInfoCommand } from '../commands/user-info.command';

@ContextMenuCommandHandler(UserInfoCommand)
export class UserInfoHandler {
  async handle(@Ctx() interaction: UserContextMenuCommandInteraction): Promise<void> {
    const user = interaction.targetUser;
    const member = interaction.targetMember;

    const lines = [`**${user.tag}** (\`${user.id}\`)`, `Account created: ${time(user.createdAt, 'R')}`];

    if (member && 'joinedAt' in member && member.joinedAt) {
      lines.push(`Joined server: ${time(member.joinedAt, 'R')}`);
    }

    await interaction.reply({ content: lines.join('\n'), flags: 'Ephemeral' });
  }
}
