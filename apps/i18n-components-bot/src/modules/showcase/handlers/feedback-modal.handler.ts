import { Ctx } from '@spraxium/common';
import { Field, ModalHandler } from '@spraxium/components';
import type { ModalContext } from '@spraxium/components';
import { FeedbackModal } from '../components/feedback-modal.component';

@ModalHandler(FeedbackModal)
export class FeedbackModalHandler {
  async handle(
    @Field('name') name: string,
    @Field('message') message: string,
    @Ctx() ctx: ModalContext,
  ): Promise<void> {
    await ctx.reply({
      content: `📝 **${name}** said:\n> ${message}`,
      flags: 'Ephemeral',
    });
  }
}
