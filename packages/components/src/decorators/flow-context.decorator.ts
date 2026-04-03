import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';

/**
 * Parameter decorator that injects the `SpraxiumContext` associated with the current interaction.
 * The context carries arbitrary state (`data`) across multi-step flows (e.g. wizards).
 *
 * @example
 * ```ts
 * @StringSelectHandler(CategorySelect)
 * class CategoryHandler {
 *   handle(@FlowContext() ctx: SpraxiumContext<WizardData>) {
 *     ctx.data.category = 'bug';
 *   }
 * }
 * ```
 */
export function FlowContext(): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number): void => {
    Reflect.defineMetadata(METADATA_KEYS.FLOW_CONTEXT_PARAM, parameterIndex, target, propertyKey ?? 'handle');
  };
}
