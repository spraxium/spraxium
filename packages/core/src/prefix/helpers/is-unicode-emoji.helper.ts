import { PREFIX_REGEX } from '../constants';

export function isUnicodeEmoji(str: string): boolean {
  return str.length <= 8 && PREFIX_REGEX.unicodeEmoji.test(str);
}
