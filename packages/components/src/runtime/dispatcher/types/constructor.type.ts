// biome-ignore lint/suspicious/noExplicitAny: generic callable type required
export type Constructor<T extends object = object> = new (...args: Array<any>) => T;
