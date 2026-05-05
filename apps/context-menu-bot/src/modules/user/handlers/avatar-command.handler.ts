import { ContextMenuCommandHandler, Ctx } from '@spraxium/common';
import type { UserContextMenuCommandInteraction } from 'discord.js';
import { AvatarCommand } from '../commands/avatar.command';

@ContextMenuCommandHandler(AvatarCommand)
export class AvatarHandler {
  async handle(@Ctx() interaction: UserContextMenuCommandInteraction): Promise<void> {
    const user = interaction.targetUser;
    const url = user.displayAvatarURL({ size: 1024, extension: 'png' });

    await interaction.reply({
      content: `Avatar of **${user.tag}**:\n${url}`,
      flags: 'Ephemeral',
    });
  }
}
