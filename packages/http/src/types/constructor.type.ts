// biome-ignore lint/suspicious/noExplicitAny: generic constructor must accept any params
export type Constructor<T = object> = new (...args: any[]) => T;
export type AnyConstructor = new (...args: Array<unknown>) => object;
