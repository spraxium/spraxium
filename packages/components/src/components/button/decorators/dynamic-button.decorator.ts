import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { DynamicButtonComponentMeta, DynamicButtonConfig } from '../interfaces';

/**
 * Class decorator that registers a dynamic button — a button whose appearance
 * and payload are computed per render. The class **must** expose a static
 * `render(item)` method returning a `ButtonRenderConfig`.
 *
 * @example
 * ```ts
 * @DynamicButton({ baseId: 'book' })
 * class BookButton {
 *   static render(book: Book): ButtonRenderConfig {
 *     return { label: book.title, style: 'secondary' };
 *   }
 * }
 * ```
 */
export function DynamicButton(config: DynamicButtonConfig): ClassDecorator {
  return (target): void => {
    const meta: DynamicButtonComponentMeta = {
      baseId: config.baseId,
      payloadTtl: config.payloadTtl,
    };
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.BUTTON_DYNAMIC, meta, target);
  };
}
