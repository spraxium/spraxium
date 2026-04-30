import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../component-metadata-keys.constant';

/**
 * Parameter decorator that injects the resolved payload bound to a
 * `@DynamicButton`'s render call. The dispatcher fetches the payload via the
 * `~p:<id>` segment in the custom ID and passes it to the handler.
 *
 * @example
 * ```ts
 * @DynamicButtonHandler(BookButton)
 * class BookHandler {
 *   handle(@Ctx() ctx: ButtonInteraction, @ButtonPayload() book: Book) {
 *     ctx.reply(`You picked ${book.title}`);
 *   }
 * }
 * ```
 */
export function ButtonPayload(): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number): void => {
    Reflect.defineMetadata(
      COMPONENT_METADATA_KEYS.BUTTON_PAYLOAD_PARAM,
      parameterIndex,
      target,
      propertyKey ?? 'handle',
    );
  };
}
