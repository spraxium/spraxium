import 'reflect-metadata';
import type { Context, Next } from 'hono';
import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { HttpController, HttpGet, HttpUseMiddleware } from '../src/decorators';
import type { HttpMiddleware } from '../src/interfaces';
import { RouteBuilder } from '../src/service/route-builder.service';
import { RouteRegistry } from '../src/service/route-registry.service';
import type { Constructor } from '../src/types';

function build(controllers: Array<Constructor>, providers: Map<Constructor, HttpMiddleware>): Hono {
  const app = new Hono();
  const deps = new Map<unknown, unknown>();
  const entries = new RouteRegistry().resolveAll(controllers, deps);
  RouteBuilder.register(app, entries, providers, deps);
  return app;
}

describe('RouteBuilder middleware resolution', () => {
  it('fails startup when a declared middleware is not registered', () => {
    class AuthMiddleware implements HttpMiddleware {
      async handle(_ctx: Context, next: Next): Promise<undefined> {
        await next();
        return undefined;
      }
    }

    @HttpController('/admin')
    class AdminController {
      @HttpGet('/secrets')
      @HttpUseMiddleware(AuthMiddleware)
      secrets() {
        return { ok: true };
      }
    }

    expect(() => build([AdminController], new Map())).toThrowError(
      /Middleware "AuthMiddleware" declared on AdminController\.secrets \(GET \/admin\/secrets\) is not registered/,
    );
  });

  it('runs registered class and method middleware in declaration order', async () => {
    const calls: Array<string> = [];
    const track = (label: string): HttpMiddleware => ({
      async handle(_ctx: Context, next: Next): Promise<undefined> {
        calls.push(label);
        await next();
        return undefined;
      },
    });

    class ClassMiddleware {}
    class MethodMiddleware {}

    @HttpController('/items')
    @HttpUseMiddleware(ClassMiddleware)
    class ItemsController {
      @HttpGet('/')
      @HttpUseMiddleware(MethodMiddleware)
      list() {
        calls.push('handler');
        return { ok: true };
      }
    }

    const app = build(
      [ItemsController],
      new Map<Constructor, HttpMiddleware>([
        [ClassMiddleware, track('class')],
        [MethodMiddleware, track('method')],
      ]),
    );

    const res = await app.request('/items/');
    expect(res.status).toBe(200);
    expect(calls).toEqual(['class', 'method', 'handler']);
  });
});
