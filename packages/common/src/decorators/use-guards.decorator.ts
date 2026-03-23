import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { GuardEntry } from '../interfaces/guard-entry.interface';
import type { SpraxiumGuard } from '../interfaces/spraxium-guard.interface';

export type GuardOptions<T extends SpraxiumGuard> = {
  [K in keyof T as K extends 'canActivate'
    ? never
    : T[K] extends (...args: Array<unknown>) => unknown
      ? never
      : K]?: T[K];
};

/**
 * Helper for passing typed options to a guard inside @UseGuards().
 *
 * @example
 *   @UseGuards(withOptions(PermissionGuard, { permissions: ['BanMembers'] }))
 */
export function withOptions<T extends SpraxiumGuard>(
  guard: new () => T,
  options: GuardOptions<T>,
): [new () => T, Record<string, unknown>] {
  return [guard, options as Record<string, unknown>];
}

export type GuardInput = (new () => SpraxiumGuard) | [new () => SpraxiumGuard, Record<string, unknown>?];

/**
 * Attaches guards to a class or a specific method.
 * Supports bare constructors, tuples with options, or a mix of both.
 * Method-level guards run after class-level and global guards.
 */
export function UseGuards(...inputs: Array<GuardInput>): ClassDecorator & MethodDecorator {
  const entries: Array<GuardEntry> = inputs.map((input) => {
    if (Array.isArray(input)) {
      const [guard, options = {}] = input;
      return { guard, options };
    }
    return { guard: input as new () => SpraxiumGuard, options: {} };
  });

  return (target: object, propertyKey?: string | symbol): void => {
    const metaKey = METADATA_KEYS.USE_GUARDS;

    if (propertyKey !== undefined) {
      const existing: Array<GuardEntry> = Reflect.getOwnMetadata(metaKey, target, propertyKey) ?? [];
      Reflect.defineMetadata(metaKey, [...existing, ...entries], target, propertyKey);
    } else {
      const existing: Array<GuardEntry> = Reflect.getOwnMetadata(metaKey, target) ?? [];
      Reflect.defineMetadata(metaKey, [...existing, ...entries], target);
    }
  };
}

/** Alias for {@link UseGuards}. */
export const Guards = UseGuards;