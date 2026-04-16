import 'reflect-metadata';
import type { ReadonlyContainer } from '@spraxium/common';
import type { Context, Handler, Hono, Next } from 'hono';
import { HTTP_METADATA_KEYS } from '../constants';
import { GuardExecutor } from '../guards';
import type { HttpGuard, HttpMiddleware, RegisteredController } from '../interfaces';
import type { Constructor } from '../types';
import { ParamResolver } from './param-resolver.service';
import { RouteRegistry } from './route-registry.service';

export class RouteBuilder {
  private static readonly paramResolver = new ParamResolver();

  static register(
    app: Hono,
    controllers: Array<RegisteredController>,
    middlewareProviders: Map<Constructor, HttpMiddleware> = new Map(),
    deps: Map<unknown, unknown> = new Map(),
    fallback?: ReadonlyContainer,
  ): void {
    const registry = new RouteRegistry();

    for (const ctrl of controllers) {
      for (const route of ctrl.routes) {
        const fullPath = ctrl.prefix + route.path;
        const handlerMethod = (ctrl.instance as Record<string, unknown>)[route.handlerName];
        if (typeof handlerMethod !== 'function') continue;

        const proto = Object.getPrototypeOf(ctrl.instance) as object;
        const methodMiddlewareClasses: Array<Constructor> =
          Reflect.getMetadata(HTTP_METADATA_KEYS.MIDDLEWARE, proto, route.handlerName) ?? [];

        const allMiddlewareClasses = [...ctrl.classMiddlewares, ...methodMiddlewareClasses];

        const middlewareHandlers: Array<Handler> = allMiddlewareClasses
          .map((cls) => middlewareProviders.get(cls))
          .filter((mw): mw is HttpMiddleware => mw !== undefined)
          .map((mw) => async (ctx: Context, next: Next): Promise<void> => {
            await mw.handle(ctx, next);
          });

        const routeGuardClasses: Array<Constructor> =
          Reflect.getMetadata(HTTP_METADATA_KEYS.GUARDS, proto, route.handlerName) ?? [];
        const allGuardClasses = [...ctrl.classGuards, ...routeGuardClasses];

        let guardHandlers: Array<Handler> = [];
        if (allGuardClasses.length > 0) {
          const guardInstances = registry.resolveGuards(allGuardClasses, deps, fallback) as Array<HttpGuard>;
          const executor = new GuardExecutor(guardInstances);
          guardHandlers = [
            async (ctx: Context, next: Next): Promise<void> => {
              const passed = await executor.execute(ctx);
              if (!passed) return;
              await next();
            },
          ];
        }

        const statusCode: number | undefined = Reflect.getMetadata(
          HTTP_METADATA_KEYS.STATUS_CODE,
          proto,
          route.handlerName,
        );

        const boundInstance = ctrl.instance;
        const boundHandlerName = route.handlerName;

        const routeHandler: Handler = async (ctx: Context) => {
          const args = await RouteBuilder.paramResolver.resolve(boundInstance, boundHandlerName, ctx);
          const result = await (handlerMethod as (...a: Array<unknown>) => unknown).apply(
            boundInstance,
            args,
          );

          if (result instanceof Response) return result;

          const status = statusCode ?? 200;
          return ctx.json(result, status as Parameters<typeof ctx.json>[1]);
        };

        app.on([route.method], [fullPath], ...guardHandlers, ...middlewareHandlers, routeHandler);
      }
    }
  }
}
