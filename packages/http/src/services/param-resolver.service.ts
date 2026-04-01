import 'reflect-metadata';
import type { Context } from 'hono';
import { HTTP_METADATA_KEYS } from '../decorators/route.decorator';
import type { ParamDefinition } from '../types';
import { ValidationPipe } from './validation-pipe.service';

export class ParamResolver {
  private readonly validation = new ValidationPipe();

  async resolve(instance: object, handlerName: string, ctx: Context): Promise<Array<unknown>> {
    const proto = Object.getPrototypeOf(instance) as object;
    const definitions: Array<ParamDefinition> =
      Reflect.getMetadata(HTTP_METADATA_KEYS.PARAMS, proto, handlerName) ?? [];

    if (definitions.length === 0) {
      return [ctx];
    }

    const maxIndex = Math.max(...definitions.map((d) => d.index));
    const args: Array<unknown> = new Array(maxIndex + 1).fill(undefined);
    let parsedBody: unknown;

    for (const def of definitions) {
      switch (def.source) {
        case 'param':
          args[def.index] = def.key ? ctx.req.param(def.key) : ctx.req.param();
          break;
        case 'query':
          args[def.index] = def.key ? ctx.req.query(def.key) : ctx.req.query();
          break;
        case 'body':
          if (parsedBody === undefined) {
            parsedBody = await ctx.req.json().catch(() => ({}));
          }
          args[def.index] = def.dto ? await this.validation.transform(def.dto, parsedBody) : parsedBody;
          break;
        case 'header':
          args[def.index] = def.key ? ctx.req.header(def.key) : ctx.req.header();
          break;
        case 'ctx':
          args[def.index] = ctx;
          break;
      }
    }

    return args;
  }
}
