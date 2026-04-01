import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import type { ReadonlyContainer } from '@spraxium/common';
import { HTTP_METADATA_KEYS } from '../decorators/route.decorator';
import type { AnyConstructor, Constructor, RouteDefinition } from '../types';

export interface RegisteredController {
  readonly instance: object;
  readonly prefix: string;
  readonly routes: Array<RouteDefinition>;
  readonly classMiddlewares: Array<Constructor>;
}

export class RouteRegistry {
  resolveServices(
    serviceCls: Array<Constructor>,
    deps: Map<unknown, unknown>,
    fallback?: ReadonlyContainer,
  ): void {
    const sorted = this.sortByDependency(serviceCls, deps, fallback);

    for (const cls of sorted) {
      const instance = this.instantiate(cls as AnyConstructor, deps, fallback);
      deps.set(cls, instance);
    }
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

    const instance = this.instantiate(ctor, deps, fallback);
    return { instance, prefix, routes, classMiddlewares };
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

    const paramTypes: Array<Constructor> | undefined = Reflect.getMetadata('design:paramtypes', ctor);
    const args: Array<unknown> = new Array(paramCount).fill(undefined);

    for (const [index, token] of injectMap) {
      args[index] = deps.get(token) ?? fallback?.get(token);
    }

    if (paramTypes) {
      for (let i = 0; i < paramCount; i++) {
        if (args[i] !== undefined) continue;
        const type = paramTypes[i];
        if (type) args[i] = deps.get(type) ?? fallback?.get(type);
      }
    }

    return new ctor(...args);
  }
}
