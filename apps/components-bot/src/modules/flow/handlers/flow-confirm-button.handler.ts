import { Ctx } from '@spraxium/common';
import { ButtonHandler, ContextService, FlowContext } from '@spraxium/components';
import type { SpraxiumContext } from '@spraxium/components';
import type { ButtonInteraction } from 'discord.js';
import { FlowConfirmButton } from '../components/flow-confirm-button.component';
import type { ConfirmData } from './flow-confirm-command.handler';

@ButtonHandler(FlowConfirmButton)
export class FlowConfirmButtonHandler {
  constructor(private readonly contexts: ContextService) {}

  async handle(
    @FlowContext() ctx: SpraxiumContext<ConfirmData>,
    @Ctx() interaction: ButtonInteraction,
  ): Promise<void> {

    await this.contexts.delete(ctx.id);

    await interaction.update({
      content: [
        '✅ **Action confirmed!**',
        '',
        `Action: \`${ctx.data.action}\``,
        `Target: <#${ctx.data.targetId}>`,
        `Confirmed by: <@${interaction.user.id}>`,
        `Context ID: \`${ctx.id}\``,
      ].join('\n'),
      components: [],
    });
  }
}
