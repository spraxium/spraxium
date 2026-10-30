import type { SpraxiumGuard } from '../interfaces';

export type GuardOptions<T extends SpraxiumGuard> = {
  [K in keyof T as K extends 'canActivate'
    ? never
    : T[K] extends (...args: Array<unknown>) => unknown
      ? never
      : K]?: T[K];
};

export type GuardInput =
  | (new (
      ...args: Array<never>
    ) => SpraxiumGuard)
  | [new (...args: Array<never>) => SpraxiumGuard, Record<string, unknown>?];
