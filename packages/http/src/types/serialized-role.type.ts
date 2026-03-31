export interface SerializedRole {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly position: number;
  readonly permissions: string;
  readonly managed: boolean;
  readonly mentionable: boolean;
}
