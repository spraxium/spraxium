import 'reflect-metadata';
import { HTTP_METADATA_KEYS } from '../constants';
import type { Constructor, HttpMethod, RouteDefinition } from '../types';

export function Controller(prefix: string): ClassDecorator {
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

export function Get(path = '/'): MethodDecorator {
  return createRouteDecorator('GET', path);
}

export function Post(path = '/'): MethodDecorator {
  return createRouteDecorator('POST', path);
}

export function Put(path = '/'): MethodDecorator {
  return createRouteDecorator('PUT', path);
}

export function Patch(path = '/'): MethodDecorator {
  return createRouteDecorator('PATCH', path);
}

export function Delete(path = '/'): MethodDecorator {
  return createRouteDecorator('DELETE', path);
}

export function UseMiddleware(...middlewareClasses: Array<Constructor>): ClassDecorator & MethodDecorator {
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

export function HttpStatus(code: number): MethodDecorator {
  return (target, propertyKey): void => {
    Reflect.defineMetadata(HTTP_METADATA_KEYS.STATUS_CODE, code, target, propertyKey as string);
  };
}
