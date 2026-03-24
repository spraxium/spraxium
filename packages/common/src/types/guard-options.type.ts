import { SpraxiumGuard } from '../interfaces';

export type GuardOptions<T extends SpraxiumGuard> = {
  [K in keyof T as K extends 'canActivate'
    ? never
    : T[K] extends (...args: Array<unknown>) => unknown
    ? never
    : K]?: T[K];
};

export type GuardInput =
  | (new () => SpraxiumGuard)
  | [new () => SpraxiumGuard, Record<string, unknown>?];