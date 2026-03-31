/**
 * Thrown by {@link SignalClient.send} when the Discord webhook POST returns
 * a non-2xx HTTP status code.
 */
export class SignalClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly body: string,
  ) {
    super(message);
    this.name = 'SignalClientError';
  }
}
