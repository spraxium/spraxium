import { Ctx } from '@spraxium/common';
import { type ModalContext, ModalHandler, ModalTextField } from '@spraxium/components';
import { ReportModal } from '../components/report-modal.component';

@ModalHandler(ReportModal)
export class ReportModalSubmitCommandHandler {
  async handle(
    @ModalTextField('description') description: string,
    @ModalTextField('email') email: string,
    @Ctx() ctx: ModalContext,
  ): Promise<void> {
    await ctx.reply({
      content: `✅ Report received!\n**Description:** ${description}${email ? `\n**Contact:** ${email}` : ''}`,
      flags: 'Ephemeral',
    });
  }
}
