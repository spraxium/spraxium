export interface PartialEmbed {
  title?: string;
  description?: string;
  color?: number;
  timestamp?: string;
  footer?: { text: string };
  thumbnail?: { url: string };
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
}
