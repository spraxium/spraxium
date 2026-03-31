import type { SlashI18nKeys } from './slash-i18n-keys.interface';

export interface SlashCommandConfig {
  name: string;
  description: string;
  guild?: string;
  dmPermission?: boolean;
  defaultMemberPermissions?: bigint | number | null;
  nsfw?: boolean;
  i18n?: SlashI18nKeys;
}
