import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../component-metadata-keys.constant';

/**
 * Parameter decorator that injects a `PayloadHandle` into a dynamic button or
 * select handler, giving you explicit lifecycle control over the bound payload.
 *
 * `@ButtonPayload()` / `@SelectPayload()` still inject the raw data as before.
 * Use `@PayloadRef()` when you additionally need to call `consume()` to
 * permanently delete the payload and prevent the handler from running again.
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
 *     await ref.consume(); // one-shot — next click gets "expired"
 *     await ctx.reply(`Purchased ${item.name}!`);
 *   }
 * }
 * ```
 */
export function PayloadRef(): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number): void => {
    Reflect.defineMetadata(
      COMPONENT_METADATA_KEYS.PAYLOAD_REF_PARAM,
      parameterIndex,
      target,
      propertyKey ?? 'handle',
    );
  };
}
