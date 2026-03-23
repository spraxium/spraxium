import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';

/**
 * Marks a class as a guard. Must implement {@link SpraxiumGuard}.
 * Use {@link GuardOption} to declare configurable properties.
 *
 * @example
 *   @Guard()
 *   export class GuildOnlyGuard implements SpraxiumGuard {
 *     canActivate(ctx: ExecutionContext): boolean {
 *       return ctx.getGuildId() !== null;
 *     }
 *   }
 */
export function Guard(): ClassDecorator {
  return (target: object): void => {
    Reflect.defineMetadata(METADATA_KEYS.GUARD, true, target);
  };
}