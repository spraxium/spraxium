import 'reflect-metadata';
import {
  type ExecutionContext,
  type GuardEntry,
  type GuardOptionConfig,
  METADATA_KEYS,
  type ReadonlyContainer,
  type SpraxiumGuard,
} from '@spraxium/common';
import { GuardRegistry } from './guard.registry';

export class GuardExecutor {
  /**
   * Container that owns each handler/listener instance. Keyed by instance (not
   * class) so two applications sharing a handler class resolve guards from
   * their own containers.
   */
  private static readonly owners = new WeakMap<object, ReadonlyContainer>();

  /** Records the DI container that owns `owner`; called by the module loader. */
  public static bindContainer(owner: unknown, container: ReadonlyContainer): void {
    if (typeof owner === 'object' && owner !== null) GuardExecutor.owners.set(owner, container);
  }

  /**
   * Runs global, class and method guards for a handler.
   *
   * When `owner` (the handler/listener instance) belongs to a module container,
   * guards registered there as providers are reused, so they receive their
   * injected dependencies. Unregistered guards are constructed with `new`.
   */
  public static async execute(
    ctor: new (...args: Array<unknown>) => unknown,
    method: string | symbol,
    ctx: ExecutionContext,
    owner?: unknown,
  ): Promise<boolean> {
    const container =
      typeof owner === 'object' && owner !== null ? GuardExecutor.owners.get(owner) : undefined;

    for (const entry of GuardRegistry.getAll()) {
      if (!(await GuardExecutor.runEntry(entry, ctx, container))) return false;
    }

    const classEntries: Array<GuardEntry> = Reflect.getOwnMetadata(METADATA_KEYS.USE_GUARDS, ctor) ?? [];
    for (const entry of classEntries) {
      if (!(await GuardExecutor.runEntry(entry, ctx, container))) return false;
    }

    const methodEntries: Array<GuardEntry> =
      Reflect.getOwnMetadata(METADATA_KEYS.USE_GUARDS, ctor.prototype, method) ?? [];
    for (const entry of methodEntries) {
      if (!(await GuardExecutor.runEntry(entry, ctx, container))) return false;
    }

    return true;
  }

  private static async runEntry(
    entry: GuardEntry,
    ctx: ExecutionContext,
    container?: ReadonlyContainer,
  ): Promise<boolean> {
    const instance = GuardExecutor.resolveGuard(entry, container);
    return Promise.resolve(instance.canActivate(ctx));
  }

  private static resolveGuard(entry: GuardEntry, container?: ReadonlyContainer): SpraxiumGuard {
    const optionMeta: Record<string, GuardOptionConfig> =
      Reflect.getOwnMetadata(METADATA_KEYS.GUARD_OPTION, entry.guard.prototype) ?? {};

    const registered = container?.get<SpraxiumGuard>(entry.guard);
    if (registered && Object.keys(optionMeta).length === 0) return registered;

    // Options are per-use (`@UseGuards(Guard, { ... })`), so never write them
    // onto a shared container instance: derive a per-call view whose
    // prototype is the registered instance, keeping its injected dependencies.
    const instance = (registered ? Object.create(registered as object) : new entry.guard()) as Record<
      string,
      unknown
    > &
      SpraxiumGuard;

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
