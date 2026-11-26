export type { ParamSource } from './param-source.type';

import type { ParamSource } from './param-source.type';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export interface ParamDefinition {
  readonly index: number;
  readonly source: ParamSource;
  readonly key?: string;
  readonly dto?: new (...args: Array<unknown>) => object;
}
