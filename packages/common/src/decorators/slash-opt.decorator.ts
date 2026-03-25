import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';

export function SlashOpt(name: string): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number): void => {
    if (propertyKey === undefined) return;

    const existing: Array<{ index: number; name: string }> =
      Reflect.getMetadata(METADATA_KEYS.SLASH_OPT_PARAM, target, propertyKey) ?? [];

    Reflect.defineMetadata(
      METADATA_KEYS.SLASH_OPT_PARAM,
      [...existing, { index: parameterIndex, name }],
      target,
      propertyKey,
    );
  };
}
