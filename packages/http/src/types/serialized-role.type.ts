/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export interface SerializedRole {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly position: number;
  readonly permissions: string;
  readonly managed: boolean;
  readonly mentionable: boolean;
}
