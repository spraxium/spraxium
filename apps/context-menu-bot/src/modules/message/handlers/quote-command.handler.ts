import { ContextMenuCommandHandler, Ctx } from '@spraxium/common';
import type { MessageContextMenuCommandInteraction } from 'discord.js';
import { QuoteCommand } from '../commands/quote.command';

@ContextMenuCommandHandler(QuoteCommand)
export class QuoteHandler {
  async handle(@Ctx() interaction: MessageContextMenuCommandInteraction): Promise<void> {
    const message = interaction.targetMessage;

    const content = message.content?.trim().length ? message.content : '*(no text content)*';

    const quoted = content
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n');

    await interaction.reply({
      content: `Quoting **${message.author.tag}**:\n${quoted}`,
      allowedMentions: { parse: [] },
    });
  }
}
