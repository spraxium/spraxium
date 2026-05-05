import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { ButtonService } from '@spraxium/components';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { ErrorsCommand } from '../commands/errors.command';
import { BoomButton, ExpiredButton } from '../components/errors.components';

@SlashCommandHandler(ErrorsCommand)
export class ErrorsCommandHandler {
  constructor(private readonly buttons: ButtonService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const stale = this.buttons.build([ExpiredButton]);
    const stalePayloadId = 'deadbeefcafe';
    const json = stale.toJSON();
    const original = json.components[0];
    if (original.type === 2 && 'custom_id' in original) {
      Object.assign(original, { custom_id: `${original.custom_id}~p:${stalePayloadId}` });
    }

    const boom = this.buttons.build([BoomButton]);

    await interaction.reply({
      content: [
        '## 💣 Error handling showcase',
        '- **Crash me**: handler throws; reply comes from `button.onErrorReply` and `onError` is invoked.',
        '- **Stale payload**: fakes a `~p:<id>` that does not exist; reply comes from `errorMessages.payloadExpired`.',
      ].join('\n'),
      components: [boom, stale],
      flags: MessageFlags.Ephemeral,
    });
  }
}
