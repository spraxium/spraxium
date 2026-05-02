import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { ModalHandlerMetadata } from '../interfaces';

/**
 * Class decorator that links a handler class to a `@ModalComponent()` builder.
 *
 * @example
 * @ModalHandler(FeedbackModal)
 * export class FeedbackModalHandler {
 *   async handle(@Ctx() ctx: ModalContext) { ... }
 * }
 */
export function ModalHandler(
  // biome-ignore lint/suspicious/noExplicitAny: any class is valid for the builder parameter
  builder: new (...args: Array<any>) => object,
): ClassDecorator {
  return (target): void => {
    const meta: ModalHandlerMetadata = { builder };
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.MODAL_HANDLER, meta, target);
  };
}
