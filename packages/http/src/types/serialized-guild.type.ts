export interface SerializedGuild {
  readonly id: string;
  readonly name: string;
  readonly icon: string | null;
  readonly memberCount: number;
  readonly ownerId: string;
  readonly createdAt: string;
  readonly features: Array<string>;
}
