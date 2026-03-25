import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';

export function SlashFocused(): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number): void => {
    if (propertyKey === undefined) return;
    Reflect.defineMetadata(METADATA_KEYS.SLASH_FOCUSED_PARAM, parameterIndex, target, propertyKey);
  };
}
