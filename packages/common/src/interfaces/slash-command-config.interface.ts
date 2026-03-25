export interface SlashCommandConfig {
  name: string;
  description: string;
  guild?: string;
  dmPermission?: boolean;
  defaultMemberPermissions?: bigint | number | null;
  nsfw?: boolean;
  i18n?: string;
}
