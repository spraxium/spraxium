import { TimestampStyles, time } from 'discord.js';

export {
  bold,
  italic,
  strikethrough,
  underscore,
  spoiler,
  inlineCode,
  codeBlock,
  blockQuote,
  quote,
  subtext,
  hyperlink,
  hideLinkEmbed,
  userMention,
  channelMention,
  roleMention,
  chatInputApplicationCommandMention,
  messageLink,
  time,
  TimestampStyles,
  type TimestampStylesString,
  heading,
  HeadingLevel,
  orderedList,
  unorderedList,
} from 'discord.js';

/** Shorthand for `time(date, TimestampStyles.RelativeTime)`. */
export function relativeTime(date: Date): string {
  return time(date, TimestampStyles.RelativeTime);
}

/** Shorthand for `time(date, TimestampStyles.LongDateTime)`. */
export function longDateTime(date: Date): string {
  return time(date, TimestampStyles.LongDateTime);
}

/** Shorthand for `time(date, TimestampStyles.ShortDate)`. */
export function shortDate(date: Date): string {
  return time(date, TimestampStyles.ShortDate);
}
