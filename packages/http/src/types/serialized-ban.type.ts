import type { SerializedUser } from './serialized-user.type';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export interface SerializedBan {
  readonly user: SerializedUser;
  readonly reason: string | null;
}
