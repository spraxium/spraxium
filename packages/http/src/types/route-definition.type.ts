import type { HttpMethod } from './http-method.type';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export interface RouteDefinition {
  readonly method: HttpMethod;
  readonly path: string;
  readonly handlerName: string;
}
