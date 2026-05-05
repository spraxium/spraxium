/**
 * Matches the three-segment base64url structure of a Discord bot token.
 * Segment lengths: ≥24 . ≥6 . ≥27
 *
 * Security: this pattern is used exclusively for redaction. It is intentionally
 * conservative — a false positive (masking a non-token) is always preferable
 * to a false negative (leaking a real token).
 */
export const DISCORD_TOKEN_PATTERN = /[\w-]{24,}\.[\w-]{6,}\.[\w-]{27,}/g;
