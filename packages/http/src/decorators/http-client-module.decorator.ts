import 'reflect-metadata';
import { HTTP_METADATA_KEYS } from '../constants';
import type { HttpClientModuleMetadata } from '../interfaces';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export function HttpClientModule(metadata: HttpClientModuleMetadata): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(HTTP_METADATA_KEYS.HTTP_CLIENT_MODULE, metadata, target);
  };
}
