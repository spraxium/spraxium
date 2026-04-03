import type { DescriptionBuilder } from '../builder';

export interface EmbedAuthorConfig {
  name: string;
  iconUrl?: string;
  url?: string;
}

export interface EmbedFooterConfig {
  text: string;
  iconUrl?: string;
}

export interface EmbedSchema {
  title?: string | ((data: unknown) => string);
  description?: string | ((data: unknown) => string) | DescriptionBuilder;
  color?: number | string | ((data: unknown) => number | string);
  url?: string | ((data: unknown) => string);
  timestamp?: boolean | Date | ((data: unknown) => Date);
  thumbnail?: string | ((data: unknown) => string);
  image?: string | ((data: unknown) => string);
  author?: EmbedAuthorConfig | ((data: unknown) => EmbedAuthorConfig);
  footer?: EmbedFooterConfig | ((data: unknown) => EmbedFooterConfig);
}

export interface EmbedMeta extends EmbedSchema {
  target?: new (...args: Array<unknown>) => unknown;
}
