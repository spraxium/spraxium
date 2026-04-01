import 'reflect-metadata';
import type { ParamDefinition, ParamSource } from '../types';
import { HTTP_METADATA_KEYS } from './route.decorator';

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

export function Param(key: string): ParameterDecorator {
  return createParamDecorator('param', key);
}

export function Query(key: string): ParameterDecorator {
  return createParamDecorator('query', key);
}

export function Body(dto?: new (...args: Array<unknown>) => object): ParameterDecorator {
  return createParamDecorator('body', undefined, dto);
}

export function Header(key: string): ParameterDecorator {
  return createParamDecorator('header', key);
}

export function Ctx(): ParameterDecorator {
  return createParamDecorator('ctx');
}
