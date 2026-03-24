import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { ExceptionLayoutClass } from '../types/exception-layout-class.type';

/**
 * Links an exception class to a layout class.
 * Keeps the layout declaration right next to the exception instead of buried in config.
 *
 * Resolution order: per-instance `layout` → `exceptions.layouts` map
 * → `@WithLayout` → `layouts.default` → `DefaultExceptionLayout`.
 *
 * @example
 * const CooldownLayout = defineExceptionLayout((ex) => ({
 *   embeds: [new EmbedBuilder().setDescription(`Wait **${ex.props.seconds}s**`)],
 *   ephemeral: true,
 * }));
 *
 * @WithLayout(CooldownLayout)
 * export class CooldownException extends SpraxiumException {
 *   constructor(props?: { seconds?: number }) {
 *     super({ code: 'COOLDOWN', props });
 *   }
 * }
 */
export function WithLayout(layoutClass: ExceptionLayoutClass): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(METADATA_KEYS.EXCEPTION_LAYOUT, layoutClass, target);
  };
}
