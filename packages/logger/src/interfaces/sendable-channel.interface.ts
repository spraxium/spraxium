/** Minimal interface for a Discord text channel or DM channel that can receive messages. */
export interface SendableChannel {
  send(opts: {
    embeds: Array<{
      title?: string;
      description?: string;
      color?: number;
      timestamp?: string;
      footer?: { text: string };
      fields?: Array<{ name: string; value: string; inline?: boolean }>;
    }>;
  }): Promise<unknown>;
}
