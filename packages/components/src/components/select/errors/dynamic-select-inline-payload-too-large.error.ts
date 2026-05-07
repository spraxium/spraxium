const DISCORD_CUSTOM_ID_MAX_LENGTH = 100;

export class DynamicSelectInlinePayloadTooLargeError extends Error {
  constructor(baseId: string, length: number, maxLength: number = DISCORD_CUSTOM_ID_MAX_LENGTH) {
    super(
      `Inline params for '${baseId}' produce a customId of ${length} chars (max ${maxLength}). Reduce param size or switch to encoding: 'store'.`,
    );
    this.name = 'DynamicSelectInlinePayloadTooLargeError';
  }
}
