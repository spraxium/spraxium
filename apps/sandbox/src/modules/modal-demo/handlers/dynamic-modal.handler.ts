import { Ctx } from '@spraxium/common';
import { Field, ModalHandler, type ModalContext } from '@spraxium/components';
import { DynamicModal } from '../modals/component-modals';

@ModalHandler(DynamicModal)
export class DynamicModalHandler {
  async handle(
    @Field('name') name: string,
    @Ctx() ctx: ModalContext,
  ): Promise<void> {
    console.log('Recebendo interacao da modal', ctx.channel?.id);
    await ctx.reply({
      content: `✅ Dynamic modal submitted by **${name}**!`,
      flags: 'Ephemeral',
    });
  }
}
