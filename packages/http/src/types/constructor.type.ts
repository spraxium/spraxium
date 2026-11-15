import type { Constructor as CommonConstructor } from '@spraxium/common';

export type Constructor<T = object> = CommonConstructor<T>;

export type AnyConstructor = new (...args: Array<unknown>) => object;
