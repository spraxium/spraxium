import 'reflect-metadata';
import { HTTP_METADATA_KEYS } from '../constants';
import type { ParamDefinition, ParamSource } from '../types';

function createParamDecorator(source: ParamSource, key?: string): ParameterDecorator {
  return (target, propertyKey, parameterIndex): void => {
    const existing: Array<ParamDefinition> =
      Reflect.getMetadata(HTTP_METADATA_KEYS.PARAMS, target, propertyKey as string) ?? [];
    existing.push({ index: parameterIndex, source, key });
    Reflect.defineMetadata(HTTP_METADATA_KEYS.PARAMS, existing, target, propertyKey as string);
  };
}

export function Param(key: string): ParameterDecorator {
  return createParamDecorator('param', key);
}

export function Query(key: string): ParameterDecorator {
  return createParamDecorator('query', key);
}

export function Body(): ParameterDecorator {
  return createParamDecorator('body');
}

export function Header(key: string): ParameterDecorator {
  return createParamDecorator('header', key);
}

export function Ctx(): ParameterDecorator {
  return createParamDecorator('ctx');
}
