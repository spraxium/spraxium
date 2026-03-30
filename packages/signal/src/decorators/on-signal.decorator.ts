import 'reflect-metadata';
import { SIGNAL_METADATA_KEYS } from '../constants';
import type { OnSignalMetadata, OnSignalOptions } from '../interfaces';

/**
 * Registers a method as a handler for the given signal event.
 * Must be used inside a `@SignalListener()` class.
 *
 * @param event   Event identifier to listen for (e.g. `'config.update'`).
 * @param options Optional configuration. Use `schema` for payload validation.
 *
 * @example
 * @OnSignal('config.update', {
 *   schema: z.object({ prefix: z.string().min(1).max(5) }),
 * })
 * async onConfigUpdate(
 *   payload: { prefix: string },
 *   envelope: SignalEnvelope,
 * ): Promise<void> {
 *   await this.configService.update(envelope.guildId, payload);
 * }
 */
export function OnSignal(event: string, options: OnSignalOptions = {}): MethodDecorator {
  return (target, propertyKey) => {
    const meta: OnSignalMetadata = { event, schema: options.schema };

    Reflect.defineMetadata(SIGNAL_METADATA_KEYS.ON_SIGNAL, meta, target as object, propertyKey);

    const list: Array<string | symbol> =
      Reflect.getMetadata(SIGNAL_METADATA_KEYS.ON_SIGNAL_LIST, target as object) ?? [];

    if (!list.includes(propertyKey)) {
      list.push(propertyKey);
      Reflect.defineMetadata(SIGNAL_METADATA_KEYS.ON_SIGNAL_LIST, list, target as object);
    }
  };
}
