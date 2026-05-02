import { Ctx } from '@spraxium/common';
import { ModalHandler, ModalTextField, type ModalContext } from '@spraxium/components';
import { FeedbackModal } from '../modals/text-modals';

@ModalHandler(FeedbackModal)
export class FeedbackModalHandler {
  async handle(
    @ModalTextField('subject') subject: string,
    @ModalTextField('message') message: string,
    @Ctx() ctx: ModalContext,
  ): Promise<void> {
    await ctx.reply({
      content: `✅ Thanks for your feedback!\n**Subject:** ${subject}\n**Message:** ${message}`,
      flags: 'Ephemeral',
    });
  }
}
