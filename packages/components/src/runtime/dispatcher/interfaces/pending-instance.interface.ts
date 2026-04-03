import type { Constructor } from '../types/constructor.type';

export interface PendingInstance {
  ctor: Constructor;
  instance: unknown;
}
