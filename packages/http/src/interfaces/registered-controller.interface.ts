import type { Constructor, RouteDefinition } from '../types';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export interface RegisteredController {
  readonly instance: object;
  readonly prefix: string;
  readonly routes: Array<RouteDefinition>;
  readonly classMiddlewares: Array<Constructor>;
  readonly classGuards: Array<Constructor>;
}
