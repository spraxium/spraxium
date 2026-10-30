import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import type { ReadonlyContainer } from '@spraxium/common';
import { HTTP_MESSAGES, HTTP_METADATA_KEYS } from '../constants';
import type { RegisteredController } from '../interfaces';
import type { AnyConstructor, Constructor, RouteDefinition } from '../types';

export class RouteRegistry {
  resolveServices(
    serviceCls: Array<Constructor>,
    deps: Map<unknown, unknown>,
    fallback?: ReadonlyContainer,
  ): void {
    const sorted = this.sortByDependency(serviceCls, deps, fallback);

    for (const cls of sorted) {
      if (deps.has(cls)) continue;
      deps.set(cls, this.resolveOrInstantiate(cls as AnyConstructor, deps, fallback));
    }
  }

  resolveGuards(
    guardClasses: Array<Constructor>,
    deps: Map<unknown, unknown>,
    fallback?: ReadonlyContainer,
  ): Array<object> {
    return guardClasses.map((cls) => this.resolveOrInstantiate(cls as AnyConstructor, deps, fallback));
  }

  /**
   * Returns the instance already owned by the HTTP dependency map or the core
   * container, constructing a new one only when neither has it. This keeps a
   * class listed both as an application provider and as an HTTP service/guard
   * a single instance with a single lifecycle owner.
   */
  private resolveOrInstantiate(
    ctor: AnyConstructor,
    deps: Map<unknown, unknown>,
    fallback?: ReadonlyContainer,
  ): object {
    const existing = deps.get(ctor) ?? fallback?.get(ctor);
    if (existing !== undefined) return existing as object;
    return this.instantiate(ctor, deps, fallback);
  }

  resolveAll(
    controllerClasses: Array<Constructor>,
    deps: Map<unknown, unknown>,
    fallback?: ReadonlyContainer,
  ): Array<RegisteredController> {
    return controllerClasses.map((cls) => this.resolve(cls as AnyConstructor, deps, fallback));
  }

  private resolve(
    ctor: AnyConstructor,
    deps: Map<unknown, unknown>,
    fallback?: ReadonlyContainer,
  ): RegisteredController {
    const prefix: string = Reflect.getMetadata(HTTP_METADATA_KEYS.PREFIX, ctor) ?? '/';
    const routes: Array<RouteDefinition> = Reflect.getMetadata(HTTP_METADATA_KEYS.ROUTES, ctor) ?? [];
    const classMiddlewares: Array<Constructor> =
      Reflect.getMetadata(HTTP_METADATA_KEYS.MIDDLEWARE, ctor) ?? [];
    const classGuards: Array<Constructor> = Reflect.getMetadata(HTTP_METADATA_KEYS.GUARDS, ctor) ?? [];

    const instance = this.instantiate(ctor, deps, fallback);
    return { instance, prefix, routes, classMiddlewares, classGuards };
  }

  private sortByDependency(
    classes: Array<Constructor>,
    deps: Map<unknown, unknown>,
    fallback?: ReadonlyContainer,
  ): Array<Constructor> {
    if (classes.length <= 1) return classes;

    const indexMap = new Map<Constructor, number>(classes.map((c, i) => [c, i]));
    const dependents: Array<Array<number>> = classes.map(() => []);
    const inDegree = new Array<number>(classes.length).fill(0);

    for (let i = 0; i < classes.length; i++) {
      const ctor = classes[i];
      const injectMap: Map<number, unknown> = Reflect.getOwnMetadata(METADATA_KEYS.INJECT, ctor) ?? new Map();
      const paramTypes: Array<Constructor> = Reflect.getMetadata('design:paramtypes', ctor) ?? [];

      for (let j = 0; j < paramTypes.length; j++) {
        const token = (injectMap.get(j) ?? paramTypes[j]) as Constructor;
        const depIdx = indexMap.get(token);

        if (depIdx !== undefined && !deps.has(token) && fallback?.get(token) === undefined) {
          dependents[depIdx].push(i);
          inDegree[i]++;
        }
      }
    }

    const queue: Array<number> = [];
    for (let i = 0; i < classes.length; i++) {
      if (inDegree[i] === 0) queue.push(i);
    }

    const sorted: Array<Constructor> = [];
    while (queue.length > 0) {
      const idx = queue.shift() as number;
      sorted.push(classes[idx]);
      for (const dependentIdx of dependents[idx]) {
        if (--inDegree[dependentIdx] === 0) queue.push(dependentIdx);
      }
    }

    if (sorted.length !== classes.length) {
      const unresolved = classes
        .filter((_, i) => inDegree[i] > 0)
        .map((c) => c.name)
        .join(', ');
      throw new Error(`[HttpServer] Circular dependency detected among services: ${unresolved}`);
    }

    return sorted;
  }

  private instantiate(
    ctor: AnyConstructor,
    deps: Map<unknown, unknown>,
    fallback?: ReadonlyContainer,
  ): object {
    const paramCount = ctor.length;
    if (paramCount === 0) return new ctor();

    const injectOnCtor: Map<number, unknown> = Reflect.getMetadata(METADATA_KEYS.INJECT, ctor) ?? new Map();
    const injectOnProto: Map<number, unknown> =
      Reflect.getMetadata(METADATA_KEYS.INJECT, (ctor as { prototype?: object }).prototype ?? {}) ??
      new Map();

    const injectMap = new Map<number, unknown>(injectOnProto);
    for (const [index, token] of injectOnCtor) injectMap.set(index, token);

    const optionalSet: Set<number> = Reflect.getOwnMetadata(METADATA_KEYS.OPTIONAL, ctor) ?? new Set();
    const paramTypes: Array<Constructor> | undefined = Reflect.getMetadata('design:paramtypes', ctor);
    const args: Array<unknown> = new Array(paramCount).fill(undefined);

    for (let i = 0; i < paramCount; i++) {
      const token = injectMap.has(i) ? injectMap.get(i) : paramTypes?.[i];
      if (token === undefined) continue;

      const resolved = deps.get(token) ?? fallback?.get(token);
      if (resolved === undefined && !optionalSet.has(i)) {
        const name = typeof token === 'function' ? (token as { name: string }).name : String(token);
        throw new Error(HTTP_MESSAGES.unresolvedDependency(ctor.name, name, i));
      }
      args[i] = resolved;
    }

    return new ctor(...args);
  }
}
