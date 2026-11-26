import { HttpError } from './http.error';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export class TooManyRequestsError extends HttpError {
  constructor(message = 'Too many requests') {
    super(message, 429);
    this.name = 'TooManyRequestsError';
  }
}
