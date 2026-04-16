import type { Constructor, RouteDefinition } from '../types';

export interface RegisteredController {
  readonly instance: object;
  readonly prefix: string;
  readonly routes: Array<RouteDefinition>;
  readonly classMiddlewares: Array<Constructor>;
  readonly classGuards: Array<Constructor>;
}
