import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { GuardOptionConfig } from '../interfaces/guard-option-config.interface';

/**
 * Marks a guard property as a configurable option.
 * Defaults can be set here; callers can override them via @UseGuards.
 *
 * @example
 *   @Guard()
 *   export class PermissionGuard implements SpraxiumGuard {
 *     @GuardOption({ required: true })
 *     permissions!: Array<string>;
 *   }
 */
export function GuardOption(config: GuardOptionConfig = {}): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const existing: Record<string | symbol, GuardOptionConfig> =
      Reflect.getOwnMetadata(METADATA_KEYS.GUARD_OPTION, target) ?? {};
    existing[propertyKey] = config;
    Reflect.defineMetadata(METADATA_KEYS.GUARD_OPTION, existing, target);
  };
}
