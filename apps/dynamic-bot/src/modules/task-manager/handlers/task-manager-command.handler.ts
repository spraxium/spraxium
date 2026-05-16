import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { V2Service } from '@spraxium/components';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { TaskManagerCommand } from '../commands/task-manager.command';
import { TaskListContainer } from '../components/TaskList.container';
import { TASKS } from '../task-manager.data';

@SlashCommandHandler(TaskManagerCommand)
export class TaskManagerHandler {
  constructor(private readonly v2: V2Service) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const payload = await this.v2.buildReply(TaskListContainer, TASKS);

    await interaction.reply({
      ...payload,
      flags: payload.flags | MessageFlags.Ephemeral,
    });
  }
}
