import 'reflect-metadata';
import { HTTP_METADATA_KEYS } from '../constants';
import type { Constructor, HttpMethod, RouteDefinition } from '../types';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export function HttpController(prefix: string): ClassDecorator {
  return (target): void => {
    Reflect.defineMetadata(HTTP_METADATA_KEYS.PREFIX, prefix, target);
  };
}

function createRouteDecorator(method: HttpMethod, path: string): MethodDecorator {
  return (target, propertyKey): void => {
    const routes: Array<RouteDefinition> =
      Reflect.getMetadata(HTTP_METADATA_KEYS.ROUTES, target.constructor) ?? [];
    routes.push({ method, path, handlerName: String(propertyKey) });
    Reflect.defineMetadata(HTTP_METADATA_KEYS.ROUTES, routes, target.constructor);
  };
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export function HttpGet(path = '/'): MethodDecorator {
  return createRouteDecorator('GET', path);
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export function HttpPost(path = '/'): MethodDecorator {
  return createRouteDecorator('POST', path);
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export function HttpPut(path = '/'): MethodDecorator {
  return createRouteDecorator('PUT', path);
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export function HttpPatch(path = '/'): MethodDecorator {
  return createRouteDecorator('PATCH', path);
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export function HttpDelete(path = '/'): MethodDecorator {
  return createRouteDecorator('DELETE', path);
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export function HttpUseMiddleware(
  ...middlewareClasses: Array<Constructor>
): ClassDecorator & MethodDecorator {
  return (target: object, propertyKey?: string | symbol): void => {
    if (propertyKey !== undefined) {
      const existing: Array<Constructor> =
        Reflect.getMetadata(HTTP_METADATA_KEYS.MIDDLEWARE, target, propertyKey) ?? [];
      Reflect.defineMetadata(
        HTTP_METADATA_KEYS.MIDDLEWARE,
        [...existing, ...middlewareClasses],
        target,
        propertyKey,
      );
    } else {
      const existing: Array<Constructor> = Reflect.getMetadata(HTTP_METADATA_KEYS.MIDDLEWARE, target) ?? [];
      Reflect.defineMetadata(HTTP_METADATA_KEYS.MIDDLEWARE, [...existing, ...middlewareClasses], target);
    }
  };
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export function HttpStatus(code: number): MethodDecorator {
  return (target, propertyKey): void => {
    Reflect.defineMetadata(HTTP_METADATA_KEYS.STATUS_CODE, code, target, propertyKey as string);
  };
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export function HttpGuards(...guardClasses: Array<Constructor>): ClassDecorator & MethodDecorator {
  return (target: object, propertyKey?: string | symbol): void => {
    if (propertyKey !== undefined) {
      const existing: Array<Constructor> =
        Reflect.getMetadata(HTTP_METADATA_KEYS.GUARDS, target, propertyKey) ?? [];
      Reflect.defineMetadata(HTTP_METADATA_KEYS.GUARDS, [...existing, ...guardClasses], target, propertyKey);
    } else {
      const existing: Array<Constructor> = Reflect.getMetadata(HTTP_METADATA_KEYS.GUARDS, target) ?? [];
      Reflect.defineMetadata(HTTP_METADATA_KEYS.GUARDS, [...existing, ...guardClasses], target);
    }
  };
}
