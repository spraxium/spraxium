import { METADATA_KEYS } from '../constants/metadata-keys.constant';

export function Inject(token: unknown): ParameterDecorator {
  return (target, _, parameterIndex) => {
    const existing: Map<number, unknown> = Reflect.getOwnMetadata(METADATA_KEYS.INJECT, target) ?? new Map();
    existing.set(parameterIndex, token);
    Reflect.defineMetadata(METADATA_KEYS.INJECT, existing, target);
  };
}

export function Optional(): ParameterDecorator {
  return (target, _, parameterIndex) => {
    const existing: Set<number> = Reflect.getOwnMetadata(METADATA_KEYS.OPTIONAL, target) ?? new Set();
    existing.add(parameterIndex);
    Reflect.defineMetadata(METADATA_KEYS.OPTIONAL, existing, target);
  };
}
