import { Ctx, SlashCommandHandler } from '@spraxium/common';
import type { V2Service } from '@spraxium/components';
import { type I18nService, buildLocalizedV2 } from '@spraxium/i18n';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { ShowcaseCommand } from '../commands/showcase.command';
import { InfoContainer } from '../schemas/info-container';
import type { InfoData } from '../schemas/info-container';

@SlashCommandHandler(ShowcaseCommand, { sub: 'v2' })
export class V2ShowcaseHandler {
  constructor(
    private readonly i18n: I18nService,
    private readonly v2: V2Service,
  ) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const locale = await this.i18n.getUserLocale(interaction.user.id);

    // The title text is resolved explicitly, data-driven approach.
    const header = await this.i18n.t(locale, 'commands.components.showcase.v2.header');

    const data: InfoData = { header };

    // The section body is resolved implicitly by buildLocalizedV2
    // reading the i18n key from @V2Section({ i18n: { text: '...' } }).
    const reply = buildLocalizedV2({
      containerClass: InfoContainer,
      locale,
      v2Service: { build: this.v2.buildSync.bind(this.v2) },
      data,
    });

    await interaction.reply({
      ...reply,
      flags: reply.flags | MessageFlags.Ephemeral,
    });
  }
}
