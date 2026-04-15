/** Recursive locale data , leaf values are always strings. */
export interface LocaleData {
  [key: string]: string | LocaleData;
}
