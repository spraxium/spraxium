import { Ctx, UseGuards, withOptions } from '@spraxium/common';
import { ButtonHandler } from '@spraxium/components';
import type { ButtonInteraction } from 'discord.js';
import { VipRoleGuard } from '../../../guards/vip-role.guard';
import { VipClaimButton } from '../components/vip-claim-button.component';

const VIP_ROLE_ID = '111122223333444455';

/**
 * The SAME guard is applied here on the button handler.
 *
 * What GuardExecutor sees for a button interaction:
 *   ctx.getCommandName()   → 'btn_vip_claim'  (the customId — set by ComponentExecutionContext)
 *   ctx.getUser()          → interaction.user
 *   ctx.getMember()        → interaction.member  (GuildMemberRoleManager available)
 *   ctx.isSlashCommand()   → false
 *
 * VipRoleGuard only calls ctx.getGuildId() and ctx.getMember().roles,
 * so it doesn't care whether the interaction is a slash command or a button.
 * The underlying member object is the same in both cases.
 *
 * Without this guard: anyone who copies the customId 'btn_vip_claim' and
 * replays it could bypass the slash command guard entirely.
 */
@UseGuards(withOptions(VipRoleGuard, { roleId: VIP_ROLE_ID }))
@ButtonHandler(VipClaimButton)
export class VipClaimButtonHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await interaction.reply({
      content: '✅ VIP perk claimed!',
      flags: 'Ephemeral',
    });
  }
}
