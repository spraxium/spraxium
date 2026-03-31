import type { HttpMethod } from './http-method.type';

export interface RouteDefinition {
  readonly method: HttpMethod;
  readonly path: string;
  readonly handlerName: string;
}
