import { Ctx } from '@spraxium/common';
import { ButtonParams, DynamicButtonHandler } from '@spraxium/components';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { ViewTaskButton } from '../components/ViewTask.button';

@DynamicButtonHandler(ViewTaskButton)
export class ViewTaskHandler {
  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @ButtonParams() params: { id: string },
  ): Promise<void> {
    await interaction.reply({
      content: `Button was clicked in section with id -> ${params.id}`,
    });
  }
}
