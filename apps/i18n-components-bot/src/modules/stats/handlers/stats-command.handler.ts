import { Ctx, SlashCommandHandler } from '@spraxium/common';
import type { V2Service } from '@spraxium/components';
import type { I18nService } from '@spraxium/i18n';
import { buildLocalizedV2 } from '@spraxium/i18n';
import type { ChatInputCommandInteraction } from 'discord.js';
import { MessageFlags } from 'discord.js';
import { StatsCommand } from '../commands/stats.command';
import { ServerStatsContainer } from '../schemas/server-stats.container';
import type { ServerStatsData } from '../schemas/server-stats.container';

@SlashCommandHandler(StatsCommand)
export class StatsCommandHandler {
  constructor(
    private readonly i18n: I18nService,
    private readonly v2: V2Service,
  ) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({ content: 'This command must be used in a server.', flags: 'Ephemeral' });
      return;
    }

    const locale = await this.i18n.getUserLocale(interaction.user.id);
    const guildName = interaction.guild.name;
    const memberCount = interaction.guild.memberCount;
    const onlineCount = interaction.guild.presences?.cache.filter((p) => p.status === 'online').size ?? 0;
    const boostLevel = interaction.guild.premiumTier;

    const [header, membersLine, onlineLine, boostLine, footer] = await Promise.all([
      this.i18n.t(locale, 'commands.components.stats.header', { guild: guildName }),
      this.i18n.t(locale, 'commands.components.stats.members', { count: String(memberCount) }),
      this.i18n.t(locale, 'commands.components.stats.online', { count: String(onlineCount) }),
      this.i18n.t(locale, 'commands.components.stats.boost', { level: String(boostLevel) }),
      this.i18n.t(locale, 'commands.components.stats.footer'),
    ]);

    const data: ServerStatsData = {
      header,
      membersLine,
      onlineLine,
      boostLevel,
      boostLine,
      iconUrl:
        interaction.guild.iconURL({ size: 128 }) ?? 'https://placehold.co/128x128/5865f2/ffffff.png?text=G',
      footer,
    };

    const reply = buildLocalizedV2({
      containerClass: ServerStatsContainer,
      locale,
      v2Service: this.v2,
      data,
    });

    await interaction.reply({
      ...reply,
      flags: reply.flags | MessageFlags.Ephemeral,
    });
  }
}
