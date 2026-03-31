import type { SerializedUser } from './serialized-user.type';

export interface SerializedBan {
  readonly user: SerializedUser;
  readonly reason: string | null;
}
