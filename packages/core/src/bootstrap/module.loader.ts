import type {
  Constructor,
  ModuleMetadata,
  SpraxiumOnBoot,
  SpraxiumOnReady,
  SpraxiumOnShutdown,
} from '@spraxium/common';
import { METADATA_KEYS } from '@spraxium/common';
import { ReadonlyContainer } from '@spraxium/common';
import { Client } from 'discord.js';
import { ListenerDispatcher } from '../listeners';
import { logger } from '../logger';
import { PrefixDispatcher } from '../prefix';
import { SlashDispatcher } from '../slash';
import { spraxiumError } from '../utils';
import { printBootTables } from './boot-table.printer';
import type { ModuleRow } from './interfaces';
import { SpraxiumContainer } from './spraxium.container';

export class ModuleLoader {
  static readonly instanceScanners: Set<(instance: unknown) => void> = new Set();
  private readonly rootContainer = new SpraxiumContainer();
  private readonly bootHooks: Array<SpraxiumOnBoot> = [];
  private readonly shutdownHooks: Array<SpraxiumOnShutdown> = [];
  private readonly readyHooks: Array<SpraxiumOnReady> = [];
  private readonly loadedModules = new Set<Constructor>();
  private readonly listenerDispatcher = new ListenerDispatcher();
  private readonly prefixDispatcher = new PrefixDispatcher();
  private readonly slashDispatcher = new SlashDispatcher();
  private readonly moduleRows: Array<ModuleRow> = [];

  load(rootModule: Constructor, client: Client, globalProviders: Map<unknown, unknown> = new Map()): void {
    for (const [token, instance] of globalProviders) {
      this.rootContainer.set(token, instance);
    }
    this.rootContainer.set(ListenerDispatcher, this.listenerDispatcher);
    this.rootContainer.set(PrefixDispatcher, this.prefixDispatcher);
    this.rootContainer.set(SlashDispatcher, this.slashDispatcher);
    this.rootContainer.set(Client, client);
    this.rootContainer.set(ReadonlyContainer, this.rootContainer);
    this.loadModule(rootModule, this.rootContainer);
    logger.debug('Module tree loaded');
  }

  private loadModule(moduleCtor: Constructor, parentContainer: SpraxiumContainer): void {
    if (this.loadedModules.has(moduleCtor)) return;
    this.loadedModules.add(moduleCtor);

    const metadata: ModuleMetadata = Reflect.getOwnMetadata(METADATA_KEYS.MODULE, moduleCtor) ?? {};
    const isGlobal = Reflect.getOwnMetadata(METADATA_KEYS.GLOBAL, moduleCtor) === true;

    const container = isGlobal ? this.rootContainer : parentContainer.createChild();

    for (const imported of metadata.imports ?? []) {
      this.loadModule(imported, container);
    }

    const sortedProviders = this.sortProviders(metadata.providers ?? [], container);
    for (const provider of sortedProviders) {
      const instance = this.instantiate(provider, container);
      container.set(provider, instance);
      this.registerLifecycle(instance);
    }

    for (const listenerCtor of metadata.listeners ?? []) {
      const instance = this.instantiate(listenerCtor, container);
      container.set(listenerCtor, instance);
      this.listenerDispatcher.registerListener(listenerCtor, instance);
    }

    for (const commandCtor of metadata.commands ?? []) {
      this.prefixDispatcher.registerCommand(commandCtor);
      this.slashDispatcher.registerCommand(commandCtor);
    }

    for (const handlerCtor of metadata.handlers ?? []) {
      const instance = this.instantiate(handlerCtor, container);
      container.set(handlerCtor, instance);
      this.prefixDispatcher.registerHandler(handlerCtor, instance);
      this.slashDispatcher.registerHandler(handlerCtor, instance);
      this.slashDispatcher.registerAutocompleteHandler(handlerCtor, instance);
      this.registerLifecycle(instance);
    }

    const exportTarget = isGlobal ? this.rootContainer : parentContainer;
    for (const exported of metadata.exports ?? []) {
      const instance = container.get(exported);
      if (instance !== undefined) {
        exportTarget.set(exported, instance);
      }
    }

    this.moduleRows.push({
      name: moduleCtor.name,
      providers: (metadata.providers ?? []).length,
      listeners: (metadata.listeners ?? []).length,
      commands: (metadata.commands ?? []).length,
      handlers: (metadata.handlers ?? []).length,
      exports: (metadata.exports ?? []).length,
      global: isGlobal,
    });

    logger.debug(`Loaded module: ${moduleCtor.name}`);
  }

  private instantiate<T>(ctor: Constructor<T>, container: SpraxiumContainer): T {
    const injectMap: Map<number, unknown> = Reflect.getOwnMetadata(METADATA_KEYS.INJECT, ctor) ?? new Map();
    const optionalSet: Set<number> = Reflect.getOwnMetadata(METADATA_KEYS.OPTIONAL, ctor) ?? new Set();

    const paramTypes: Array<Constructor> = Reflect.getMetadata('design:paramtypes', ctor) ?? [];
    const args: Array<unknown> = [];

    for (let i = 0; i < paramTypes.length; i++) {
      const token = injectMap.get(i) ?? paramTypes[i];
      const resolved = container.get(token);

      if (resolved === undefined && !optionalSet.has(i)) {
        const name = typeof token === 'function' ? (token as { name: string }).name : String(token);
        spraxiumError(
          'ModuleLoader',
          `cannot resolve dependency for ${ctor.name}`,
          [
            `Could not resolve "${name}" at constructor parameter index ${i}.`,
            'The token is not registered in the DI container at this scope.',
          ],
          [
            `Make sure "${name}" is listed in providers[] of its owning module.`,
            'If it lives in another module, that module must export it and be',
            `imported where ${ctor.name} is declared.`,
            'If it is an optional dependency, add @Optional() to the parameter.',
          ],
        );
      }

      args.push(resolved);
    }

    try {
      return new ctor(...args);
    } catch (err) {
      spraxiumError(
        'ModuleLoader',
        `failed to instantiate ${ctor.name}`,
        [
          `The constructor of "${ctor.name}" threw an error during DI instantiation.`,
          err instanceof Error ? err.message : String(err),
        ],
        [
          `Check that the constructor of "${ctor.name}" does not throw during initialization.`,
          'Move complex setup logic to the onBoot() lifecycle hook instead.',
        ],
      );
    }
  }

  private sortProviders(providers: Array<Constructor>, container: SpraxiumContainer): Array<Constructor> {
    if (providers.length <= 1) return providers;

    const indexMap = new Map<Constructor, number>(providers.map((c, i) => [c, i]));
    const dependents: Array<Array<number>> = providers.map(() => []);
    const inDegree = new Array<number>(providers.length).fill(0);

    for (let i = 0; i < providers.length; i++) {
      const ctor = providers[i];
      const injectMap: Map<number, unknown> = Reflect.getOwnMetadata(METADATA_KEYS.INJECT, ctor) ?? new Map();
      const paramTypes: Array<Constructor> = Reflect.getMetadata('design:paramtypes', ctor) ?? [];

      for (let j = 0; j < paramTypes.length; j++) {
        const token = (injectMap.get(j) ?? paramTypes[j]) as Constructor;
        const depIdx = indexMap.get(token);

        if (depIdx !== undefined && container.get(token) === undefined) {
          dependents[depIdx].push(i);
          inDegree[i]++;
        }
      }
    }

    const queue: Array<number> = [];
    for (let i = 0; i < providers.length; i++) {
      if (inDegree[i] === 0) queue.push(i);
    }

    const sorted: Array<Constructor> = [];
    while (queue.length > 0) {
      const idx = queue.shift() as number;
      sorted.push(providers[idx]);
      for (const dependentIdx of dependents[idx]) {
        if (--inDegree[dependentIdx] === 0) queue.push(dependentIdx);
      }
    }

    if (sorted.length !== providers.length) {
      const unresolved = providers
        .filter((_, i) => inDegree[i] > 0)
        .map((c) => c.name)
        .join(', ');
      spraxiumError(
        'ModuleLoader',
        'circular dependency detected in providers',
        [`A circular dependency was found among: ${unresolved}`],
        ['Review the constructor dependencies of your providers for circular references.'],
      );
    }

    return sorted;
  }

  private registerLifecycle(instance: unknown): void {
    if (instance && typeof (instance as SpraxiumOnBoot).onBoot === 'function') {
      this.bootHooks.push(instance as SpraxiumOnBoot);
    }
    if (instance && typeof (instance as SpraxiumOnShutdown).onShutdown === 'function') {
      this.shutdownHooks.push(instance as SpraxiumOnShutdown);
    }
    if (instance && typeof (instance as SpraxiumOnReady).onReady === 'function') {
      this.readyHooks.push(instance as SpraxiumOnReady);
    }
    for (const scanner of ModuleLoader.instanceScanners) {
      scanner(instance);
    }
  }

  async runBootHooks(): Promise<void> {
    for (const hook of this.bootHooks) {
      await hook.onBoot();
    }
  }

  async runShutdownHooks(): Promise<void> {
    await Promise.allSettled(this.shutdownHooks.map((h) => h.onShutdown()));
  }

  async runReadyHooks(client: Client<true>): Promise<void> {
    for (const hook of this.readyHooks) {
      await hook.onReady(client);
    }
  }

  getContainer(): SpraxiumContainer {
    return this.rootContainer;
  }

  bindListeners(client: Client): void {
    this.listenerDispatcher.bind(client);
  }

  getPrefixDispatcher(): PrefixDispatcher {
    return this.prefixDispatcher;
  }

  getSlashDispatcher(): SlashDispatcher {
    return this.slashDispatcher;
  }

  printBootTables(): void {
    printBootTables(
      this.moduleRows,
      this.listenerDispatcher.getResolved(),
      this.prefixDispatcher.getResolved(),
      this.slashDispatcher.getResolved(),
    );
  }
}
