/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export interface SerializedGuild {
  readonly id: string;
  readonly name: string;
  readonly icon: string | null;
  readonly memberCount: number;
  readonly ownerId: string;
  readonly createdAt: string;
  readonly features: Array<string>;
}
