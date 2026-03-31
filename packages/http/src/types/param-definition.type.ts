export type { ParamSource } from './param-source.type';

import type { ParamSource } from './param-source.type';

export interface ParamDefinition {
  readonly index: number;
  readonly source: ParamSource;
  readonly key?: string;
}
