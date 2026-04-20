import { Ctx, SlashCommandHandler } from '@spraxium/common';
import type { ButtonService, EmbedService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ButtonsCommand } from '../commands/buttons.command';
import { ApproveButton } from '../components/approve-button.component';
import { ButtonShowcaseEmbed } from '../components/button-showcase-embed.component';
import { DeleteButton } from '../components/delete-button.component';
import { DisabledButton } from '../components/disabled-button.component';
import { DocsLinkButton } from '../components/docs-link-button.component';
import { PrimaryButton } from '../components/primary-button.component';
import { SecondaryButton } from '../components/secondary-button.component';

@SlashCommandHandler(ButtonsCommand)
export class ButtonsCommandHandler {
  constructor(
    private readonly embeds: EmbedService,
    private readonly buttons: ButtonService,
  ) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = this.embeds.build(ButtonShowcaseEmbed);

    await interaction.reply({
      embeds: [embed],
      components: [
        this.buttons.build([PrimaryButton, SecondaryButton]),
        this.buttons.build([ApproveButton, DeleteButton, DisabledButton]),
        this.buttons.build(DocsLinkButton),
      ],
      flags: 'Ephemeral',
    });
  }
}
