import type { ExecutionContext } from '@spraxium/common';
import type { ExceptionLayout } from './interfaces';
import type { SpraxiumException } from './spraxium.exception';
import type { ExceptionLayoutClass, LayoutFn } from './types';

/**
 * Creates an ExceptionLayout class from a plain function.
 *
 * Use this when you don't want to write a full class. The returned value
 * is a proper constructor and can be used anywhere a layout class is expected:
 * in `@WithLayout`, in `exceptions.layouts`, or as a per-instance override.
 *
 * @example
 * const CooldownLayout = defineExceptionLayout((ex) => ({
 *   embeds: [
 *     new EmbedBuilder()
 *       .setColor(0xff6b6b)
 *       .setDescription(`⏳ Wait **${ex.props.seconds}s** and try again.`),
 *   ],
 *   ephemeral: true,
 * }));
 *
 * @WithLayout(CooldownLayout)
 * export class CooldownException extends SpraxiumException { ... }
 */
export function defineExceptionLayout(fn: LayoutFn): ExceptionLayoutClass {
  return class implements ExceptionLayout {
    build(exception: SpraxiumException, ctx: ExecutionContext) {
      return fn(exception, ctx);
    }
  };
}
