import 'reflect-metadata';
import { HTTP_METADATA_KEYS } from '../constants';
import type { ParamDefinition, ParamSource } from '../types';

function createParamDecorator(
  source: ParamSource,
  key?: string,
  dto?: new (...args: Array<unknown>) => object,
): ParameterDecorator {
  return (target, propertyKey, parameterIndex): void => {
    const existing: Array<ParamDefinition> =
      Reflect.getMetadata(HTTP_METADATA_KEYS.PARAMS, target, propertyKey as string) ?? [];
    existing.push({ index: parameterIndex, source, key, dto });
    Reflect.defineMetadata(HTTP_METADATA_KEYS.PARAMS, existing, target, propertyKey as string);
  };
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export function HttpParam(key: string): ParameterDecorator {
  return createParamDecorator('param', key);
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export function HttpQuery(key: string): ParameterDecorator {
  return createParamDecorator('query', key);
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export function HttpBody(dto?: new (...args: Array<unknown>) => object): ParameterDecorator {
  return createParamDecorator('body', undefined, dto);
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export function HttpHeader(key: string): ParameterDecorator {
  return createParamDecorator('header', key);
}

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export function HttpCtx(): ParameterDecorator {
  return createParamDecorator('ctx');
}
