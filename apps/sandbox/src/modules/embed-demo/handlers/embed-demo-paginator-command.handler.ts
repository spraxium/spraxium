import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { Colors, EmbedService, desc, inlineCode } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { EmbedDemoCommand } from '../commands/embed-demo.command';

@SlashCommandHandler(EmbedDemoCommand, { sub: 'paginator' })
export class EmbedDemoPaginatorHandler {
  constructor(private readonly embeds: EmbedService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const body = desc()
      .line(`${inlineCode('EmbedService.simple()')} builds a quick embed without declaring a schema class.`)
      .empty()
      .line(`Combine it with the ${inlineCode('desc()')} builder for rich descriptions.`)
      .subtext('No @Embed decorator required.')
      .build();

    const embed = this.embeds.simple('📦 EmbedService.simple()', body, Colors.Blue);
    await interaction.reply({ embeds: [embed] });
  }
}
