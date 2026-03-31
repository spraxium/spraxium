export interface SerializedUser {
  readonly id: string;
  readonly username: string;
  readonly discriminator: string;
  readonly avatar: string | null;
  readonly bot: boolean;
  readonly createdAt: string;
}
