import { Ctx } from '@spraxium/common';
import { ModalHandler, ModalTextField, type ModalContext } from '@spraxium/components';
import { ReportModal } from '../modals/text-modals';

@ModalHandler(ReportModal)
export class ReportModalHandler {
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
