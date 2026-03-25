// biome-ignore lint/suspicious/noExplicitAny: Constructor type requires any[] for class compatibility
export type Constructor<T = unknown> = new (...args: Array<any>) => T;

export interface ResolvedListenerEntry {
  className: string;
  event: string;
  method: string;
  once: boolean;
}

export interface HandlerEntry {
  ctor: Constructor;
  event: string;
  instance: unknown;
  method: string | symbol;
  /** true → client.once(), false → client.on() */
  once: boolean;
}
