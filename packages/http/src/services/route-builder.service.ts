import 'reflect-metadata';
import type { Context, Handler, Hono, Next } from 'hono';
import { HTTP_METADATA_KEYS } from '../decorators/route.decorator';
import type { HttpMiddleware } from '../middleware/logger.middleware';
import type { Constructor } from '../types';
import { ParamResolver } from './param-resolver.service';
import type { RegisteredController } from './route-registry.service';

export class RouteBuilder {
  private static readonly paramResolver = new ParamResolver();

  static register(
    app: Hono,
    controllers: Array<RegisteredController>,
    middlewareProviders: Map<Constructor, HttpMiddleware> = new Map(),
  ): void {
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

        const statusCode: number | undefined = Reflect.getMetadata(
          HTTP_METADATA_KEYS.STATUS_CODE,
          proto,
          route.handlerName,
        );

        const boundInstance = ctrl.instance;
        const boundHandlerName = route.handlerName;

        const routeHandler: Handler = async (ctx: Context) => {
          const args = await this.paramResolver.resolve(boundInstance, boundHandlerName, ctx);
          const result = await (handlerMethod as (...a: Array<unknown>) => unknown).apply(
            boundInstance,
            args,
          );

          if (result instanceof Response) return result;

          const status = statusCode ?? 200;
          return ctx.json(result, status as Parameters<typeof ctx.json>[1]);
        };

        app.on([route.method], [fullPath], ...middlewareHandlers, routeHandler);
      }
    }
  }
}
