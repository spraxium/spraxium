import { Ctx } from '@spraxium/common';
import { DynamicSelectHandler, SelectParams, SelectedValues } from '@spraxium/components';
import { MessageFlags, type StringSelectMenuInteraction } from 'discord.js';
import { FilterSelect } from '../components/filter-select.component';

@DynamicSelectHandler(FilterSelect)
export class FilterSelectHandler {
  async handle(
    @Ctx() interaction: StringSelectMenuInteraction,
    @SelectedValues() picks: ReadonlyArray<string>,
    @SelectParams() params: { audience: string },
  ): Promise<void> {
    await interaction.reply({
      content: [
        '## 🔍 Filtered',
        `Audience: **${params.audience}**`,
        `Topics: ${picks.map((s) => `\`${s}\``).join(', ')}`,
        '',
        `_Note: this interaction used \`encoding: 'inline'\` — no payload was stored. The audience param came directly from the custom ID._`,
      ].join('\n'),
      flags: MessageFlags.Ephemeral,
    });
  }
}
