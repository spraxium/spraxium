import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import { SIGNAL_METADATA_KEYS } from '../constants';

/**
 * Marks a class as a signal listener.
 * Methods within the class may be decorated with @OnSignal() to handle events.
 *
 * No need to also apply @Injectable() — this decorator covers it.
 *
 * Users must add the class to the `providers` array of their @Module().
 *
 * @example
 * @SignalListener()
 * export class ConfigListener {
 *   constructor(private readonly configService: GuildConfigService) {}
 *
 *   @OnSignal('config.update', { schema: z.object({ prefix: z.string() }) })
 *   async onConfigUpdate(
 *     payload: { prefix: string },
 *     envelope: SignalEnvelope,
 *   ): Promise<void> {
 *     await this.configService.update(envelope.guildId, payload);
 *   }
 * }
 */
export function SignalListener(): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(SIGNAL_METADATA_KEYS.SIGNAL_LISTENER, true, target);
    Reflect.defineMetadata(METADATA_KEYS.INJECTABLE, true, target);
  };
}
