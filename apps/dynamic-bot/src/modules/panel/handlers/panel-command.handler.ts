import { Ctx, SlashCommandHandler, SlashOpt } from '@spraxium/common';
import { V2Service } from '@spraxium/components';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { PanelCommand } from '../commands/panel.command';
import type { PanelTemplate } from '../panel.data';
import { BUTTONS_PANEL, SELECT_PANEL } from '../panel.data';
import { PanelContainer } from '../schemas/panel.container';

@SlashCommandHandler(PanelCommand)
export class PanelCommandHandler {
  constructor(private readonly v2: V2Service) {}

  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashOpt('type') type: string,
    @SlashOpt('empty') empty: boolean | null,
  ): Promise<void> {
    const base = type === 'select' ? SELECT_PANEL : BUTTONS_PANEL;
    const data: PanelTemplate = empty ? { ...base, categories: [] } : base;

    const payload = await this.v2.buildReply(PanelContainer, data);
    await interaction.reply({
      ...payload,
      flags: payload.flags | MessageFlags.Ephemeral,
    });
  }
}
