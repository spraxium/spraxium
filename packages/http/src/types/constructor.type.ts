/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
// biome-ignore lint/suspicious/noExplicitAny: generic constructor must accept any params
export type Constructor<T = object> = new (...args: any[]) => T;
/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export type AnyConstructor = new (...args: Array<unknown>) => object;
