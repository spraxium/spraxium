import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { ButtonService, EmbedService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ComponentDemoCommand } from '../commands/component-demo.command';
import {
  ApproveButton,
  DeleteButton,
  DisabledButton,
  GitHubLinkButton,
  PrimaryButton,
  SecondaryButton,
} from '../schemas/buttons';
import { ButtonShowcaseEmbed } from '../schemas/embeds';

@SlashCommandHandler(ComponentDemoCommand, { sub: 'buttons' })
export class ButtonsDemoHandler {
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
        this.buttons.build(GitHubLinkButton),
      ],
      flags: 'Ephemeral',
    });
  }
}
