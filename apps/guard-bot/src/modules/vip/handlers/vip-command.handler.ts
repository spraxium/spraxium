import { Ctx, SlashCommandHandler, UseGuards, withOptions } from '@spraxium/common';
import { ButtonService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { VipRoleGuard } from '../../../guards/vip-role.guard';
import { VipCommand } from '../commands/vip.command';
import { VipClaimButton } from '../components/vip-claim-button.component';

/**
 * Replace this with your actual VIP role ID.
 * In a real bot you'd pull this from a config service or a static constant module.
 */
const VIP_ROLE_ID = '111122223333444455';

/**
 * Guard is declared on the *class* — it applies to the `handle` method automatically.
 *
 * What GuardExecutor sees for a slash command:
 *   ctx.getCommandName()   → 'vip'
 *   ctx.getUser()          → interaction.user
 *   ctx.getMember()        → interaction.member  (GuildMemberRoleManager available)
 *   ctx.isSlashCommand()   → true
 */
@UseGuards(withOptions(VipRoleGuard, { roleId: VIP_ROLE_ID }))
@SlashCommandHandler(VipCommand)
export class VipCommandHandler {
  constructor(private readonly buttons: ButtonService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({
      content: '👑 Welcome to the VIP panel!',
      components: [this.buttons.build(VipClaimButton)],
      flags: 'Ephemeral',
    });
  }
}
