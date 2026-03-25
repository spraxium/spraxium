import 'reflect-metadata';
import {
  type ExecutionContext,
  type GuardEntry,
  type GuardOptionConfig,
  METADATA_KEYS,
  type SpraxiumGuard,
} from '@spraxium/common';
import { GuardRegistry } from './guard.registry';

export class GuardExecutor {
  public static async execute(
    ctor: new (...args: Array<unknown>) => unknown,
    method: string | symbol,
    ctx: ExecutionContext,
  ): Promise<boolean> {
    for (const entry of GuardRegistry.getAll()) {
      if (!(await GuardExecutor.runEntry(entry, ctx))) return false;
    }

    const classEntries: Array<GuardEntry> = Reflect.getOwnMetadata(METADATA_KEYS.USE_GUARDS, ctor) ?? [];
    for (const entry of classEntries) {
      if (!(await GuardExecutor.runEntry(entry, ctx))) return false;
    }

    const methodEntries: Array<GuardEntry> =
      Reflect.getOwnMetadata(METADATA_KEYS.USE_GUARDS, ctor.prototype, method) ?? [];
    for (const entry of methodEntries) {
      if (!(await GuardExecutor.runEntry(entry, ctx))) return false;
    }

    return true;
  }

  private static async runEntry(entry: GuardEntry, ctx: ExecutionContext): Promise<boolean> {
    const instance = GuardExecutor.resolveGuard(entry);
    return Promise.resolve(instance.canActivate(ctx));
  }

  private static resolveGuard(entry: GuardEntry): SpraxiumGuard {
    const instance = new entry.guard() as Record<string, unknown> & SpraxiumGuard;

    const optionMeta: Record<string, GuardOptionConfig> =
      Reflect.getOwnMetadata(METADATA_KEYS.GUARD_OPTION, entry.guard.prototype) ?? {};

    for (const [key, config] of Object.entries(optionMeta)) {
      let value: unknown = config.default;

      if (Object.prototype.hasOwnProperty.call(entry.options, key)) {
        value = entry.options[key];
      }

      if (value === undefined && config.required) {
        throw new Error(`Guard option "${key}" is required in ${entry.guard.name} but was not provided.`);
      }

      if (value !== undefined) {
        instance[key] = value;
      }
    }

    return instance;
  }
}
