import { ContextMenuCommandHandler, Ctx } from '@spraxium/common';
import type { MessageContextMenuCommandInteraction } from 'discord.js';
import { GetLinkCommand } from '../commands/get-link.command';

@ContextMenuCommandHandler(GetLinkCommand)
export class GetLinkHandler {
  async handle(@Ctx() interaction: MessageContextMenuCommandInteraction): Promise<void> {
    const message = interaction.targetMessage;
    const guildId = message.guildId ?? '@me';

    const link = `https://discord.com/channels/${guildId}/${message.channelId}/${message.id}`;

    await interaction.reply({ content: link, flags: 'Ephemeral' });
  }
}
