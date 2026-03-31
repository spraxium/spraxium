import 'reflect-metadata';
import { HTTP_METADATA_KEYS, INJECT_METADATA_KEY } from '../constants';
import type { RegisteredController } from '../interfaces';
import type { AnyConstructor, Constructor, RouteDefinition } from '../types';

export class RouteRegistry {
  resolveAll(
    controllerClasses: Array<Constructor>,
    deps: Map<unknown, unknown>,
  ): Array<RegisteredController> {
    return controllerClasses.map((cls) => this.resolve(cls as AnyConstructor, deps));
  }

  private resolve(ctor: AnyConstructor, deps: Map<unknown, unknown>): RegisteredController {
    const prefix: string = Reflect.getMetadata(HTTP_METADATA_KEYS.PREFIX, ctor) ?? '/';
    const routes: Array<RouteDefinition> = Reflect.getMetadata(HTTP_METADATA_KEYS.ROUTES, ctor) ?? [];
    const classMiddlewares: Array<Constructor> =
      Reflect.getMetadata(HTTP_METADATA_KEYS.MIDDLEWARE, ctor) ?? [];

    const instance = this.instantiate(ctor, deps);
    return { instance, prefix, routes, classMiddlewares };
  }

  private instantiate(ctor: AnyConstructor, deps: Map<unknown, unknown>): object {
    const paramCount = ctor.length;
    if (paramCount === 0) return new ctor();

    const injectOnCtor: Array<{ index: number; token: unknown }> =
      Reflect.getMetadata(INJECT_METADATA_KEY, ctor) ?? [];
    const injectOnProto: Array<{ index: number; token: unknown }> =
      Reflect.getMetadata(INJECT_METADATA_KEY, (ctor as { prototype?: object }).prototype ?? {}) ?? [];

    const injectMap = new Map<number, unknown>();
    for (const { index, token } of injectOnProto) injectMap.set(index, token);
    for (const { index, token } of injectOnCtor) injectMap.set(index, token);

    const paramTypes: Array<Constructor> | undefined = Reflect.getMetadata('design:paramtypes', ctor);
    const args: Array<unknown> = new Array(paramCount).fill(undefined);

    for (const [index, token] of injectMap) {
      args[index] = deps.get(token);
    }

    if (paramTypes) {
      for (let i = 0; i < paramCount; i++) {
        if (args[i] !== undefined) continue;
        const type = paramTypes[i];
        if (type) args[i] = deps.get(type);
      }
    }

    return new ctor(...args);
  }
}
