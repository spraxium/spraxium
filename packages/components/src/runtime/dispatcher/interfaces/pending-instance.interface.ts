import type { Constructor } from './constructor.type';

export interface PendingInstance {
  ctor: Constructor;
  instance: unknown;
}
