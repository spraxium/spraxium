import 'reflect-metadata';
import { ConfigurationException } from '@spraxium/core';
import { MESSAGES } from '../constants/messages.constant';
import { SCHEDULE_METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { AfterOnlineJobMetadata } from '../interfaces/after-online-job-metadata.interface';
import type { AfterOnlineOptions } from '../interfaces/after-online-options.interface';

/**
 * Schedules a method to run once, after the Discord `ready` event fires.
 *
 * Unlike `@Timeout`, which counts from the application boot, this decorator waits
 * until the bot is fully connected to Discord and the `client.once('ready')` event
 * has been emitted. Only then does the `ms` countdown begin.
 *
 * After execution, the job is automatically unregistered.
 *
 * @param ms - Delay in milliseconds after the ready event. `0` runs as soon as the
 *   event fires, on the next event loop tick.
 * @param options.name - Unique name for the job. Mainly useful for logging.
 * @param options.disabled - If `true`, the job is registered but never executed.
 *
 * @example
 * // Fetch guild data 5 seconds after the bot connects
 * \@AfterOnline(5_000)
 * async prefetchGuilds() {
 *   for (const guild of this.client.guilds.cache.values()) {
 *     await guild.members.fetch();
 *   }
 * }
 *
 * @example
 * // Run immediately after ready (ms = 0)
 * \@AfterOnline(0, { name: 'register-commands' })
 * async registerSlashCommands() {
 *   await this.commandManager.deploy();
 * }
 */
export function AfterOnline(ms: number, options: AfterOnlineOptions = {}): MethodDecorator {
  if (ms < 0) {
    throw new ConfigurationException({
      key: 'afterOnlineMs',
      reason: MESSAGES.AFTER_ONLINE_NEGATIVE_MS(ms),
    });
  }

  return (target, propertyKey, _descriptor) => {
    const meta: AfterOnlineJobMetadata = { ms, ...options };
    Reflect.defineMetadata(SCHEDULE_METADATA_KEYS.AFTER_ONLINE, meta, target as object, propertyKey);
  };
}
