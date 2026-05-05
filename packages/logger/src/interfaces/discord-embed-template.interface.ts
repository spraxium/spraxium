export interface EmbedFooterTemplate {
  text: string;
}

export interface EmbedThumbnailTemplate {
  url: string;
}

export interface EmbedFieldTemplate {
  name: string;
  value: string;
  inline?: boolean;
}

/** Template used to build Discord embed log messages. Supports `{{variable}}` interpolation. */
export interface DiscordEmbedTemplate {
  title?: string;
  description?: string;
  color?: number;
  footer?: EmbedFooterTemplate;
  timestamp?: boolean;
  thumbnail?: EmbedThumbnailTemplate;
  fields?: Array<EmbedFieldTemplate>;
}
