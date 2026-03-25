export interface DiscordEmbedTemplate {
  title?: string;
  description?: string;
  color?: number;
  footer?: { text: string };
  timestamp?: boolean;
  thumbnail?: { url: string };
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
}
