import 'reflect-metadata';
import type { HttpGuard } from '../guards';
import type { HttpMiddleware } from '../middleware';
import type { Constructor } from '../types';
import { HTTP_METADATA_KEYS } from './route.decorator';

export interface HttpClientModuleMetadata {
  readonly services?: Array<Constructor>;
  readonly controllers?: Array<Constructor>;
  readonly guards?: Array<HttpGuard>;
  readonly middleware?: Array<HttpMiddleware>;
  readonly middlewareProviders?: Map<Constructor, HttpMiddleware>;
}

export function HttpClientModule(metadata: HttpClientModuleMetadata): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(HTTP_METADATA_KEYS.HTTP_CLIENT_MODULE, metadata, target);
  };
}
