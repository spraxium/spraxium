export const PREFIX_REGEX = {
  // Color
  hexColor: /^#?([0-9a-fA-F]{6})$/,

  // Duration
  durationSegment: /\d+\s*(ms|s|m|h|d|w)/gi,
  durationUnit: /^(\d+)\s*(ms|s|m|h|d|w)$/i,

  // Emoji
  customEmoji: /^<a?:(\w+):(\d{17,20})>$/,
  unicodeEmoji: /^\p{Emoji_Presentation}(\u{200D}\p{Emoji_Presentation})*/u,

  // Discord mentions & snowflakes
  snowflake: /^\d{17,20}$/,
  userMention: /^<@!?(\d{17,20})>$/,
  channelMention: /^<#(\d{17,20})>$/,
  roleMention: /^<@&(\d{17,20})>$/,
};
