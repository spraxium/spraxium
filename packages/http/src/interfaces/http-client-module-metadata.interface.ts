import type { Constructor } from '../types';
import type { HttpGuard } from './http-guard.interface';
import type { HttpMiddleware } from './http-middleware.interface';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export interface HttpClientModuleMetadata {
  readonly services?: Array<Constructor>;
  readonly controllers?: Array<Constructor>;
  readonly guards?: Array<Constructor<HttpGuard>>;
  readonly middleware?: Array<HttpMiddleware>;
  readonly middlewareProviders?: Map<Constructor, HttpMiddleware>;
}
