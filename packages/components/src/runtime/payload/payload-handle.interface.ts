/**
 * A handle to the payload bound to the current interaction.
 * Inject it with `@PayloadRef()` to gain lifecycle control over the payload.
 *
 * Calling `consume()` permanently deletes the payload from the store, so
 * subsequent clicks will receive the "payload expired" error rather than
 * re-executing the handler; useful for one-shot actions.
 *
 * @example
 * ```ts
 * @DynamicButtonHandler(BuyButton)
 * class BuyButtonHandler {
 *   async handle(
 *     @Ctx() ctx: ButtonInteraction,
 *     @ButtonPayload() item: Item,
 *     @PayloadRef() ref: PayloadHandle,
 *   ) {
 *     await ref.consume(); // prevent double purchase
 *     await ctx.reply(`Purchased ${item.name}!`);
 *   }
 * }
 * ```
 */
export interface PayloadHandle {
  /** The raw payload ID embedded in the custom ID. */
  readonly id: string;
  /**
   * Deletes the payload from the store.
   * Any future interaction that carries the same custom ID will receive a
   * "payload expired" response instead of reaching the handler.
   */
  consume(): Promise<void>;
}
