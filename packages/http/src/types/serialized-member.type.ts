import type { SerializedRole } from './serialized-role.type';

export interface SerializedMember {
  readonly id: string;
  readonly username: string;
  readonly displayName: string;
  readonly discriminator: string;
  readonly avatar: string | null;
  readonly bot: boolean;
  readonly joinedAt: string | null;
  readonly createdAt: string;
  readonly roles: Array<SerializedRole>;
  readonly pending: boolean;
  readonly communicationDisabledUntil: string | null;
}
