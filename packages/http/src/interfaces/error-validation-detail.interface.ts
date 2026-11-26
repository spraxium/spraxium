/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export interface ValidationDetail {
  readonly property: string;
  readonly constraints: Record<string, string>;
}
