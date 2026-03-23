// biome-ignore lint/suspicious/noExplicitAny: constructor type requires Array<any> for class compatibility
export type Constructor<T = unknown> = new (...args: Array<any>) => T;