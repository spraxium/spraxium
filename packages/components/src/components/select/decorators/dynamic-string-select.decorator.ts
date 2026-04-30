import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { DynamicSelectComponentMeta, DynamicStringSelectConfig } from '../interfaces';

/**
 * Class decorator that registers a dynamic string select menu — a select whose
 * options are computed per render. The class **must** expose a static
 * `render(items)` method returning a `SelectRenderConfig`.
 *
 * @example
 * ```ts
 * @DynamicStringSelect({ baseId: 'topic', placeholder: 'Pick a topic' })
 * class TopicSelect {
 *   static render(topics: Topic[]): SelectRenderConfig {
 *     return {
 *       options: topics.map((t) => ({ label: t.name, value: t.slug })),
 *     };
 *   }
 * }
 * ```
 */
export function DynamicStringSelect(config: DynamicStringSelectConfig): ClassDecorator {
  return (target): void => {
    const meta: DynamicSelectComponentMeta = {
      baseId: config.baseId,
      payloadTtl: config.payloadTtl,
      placeholder: config.placeholder,
      minValues: config.minValues,
      maxValues: config.maxValues,
      disabled: config.disabled,
    };
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.SELECT_DYNAMIC, meta, target);
  };
}
