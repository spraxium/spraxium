export interface SendOptions {
  /**
   * Overrides the webhook's display name for this specific message.
   */
  username?: string;

  /**
   * Overrides the webhook's avatar for this specific message.
   */
  avatarURL?: string;

  /**
   * Sends the message into a specific thread inside the channel.
   */
  threadId?: string;
}
