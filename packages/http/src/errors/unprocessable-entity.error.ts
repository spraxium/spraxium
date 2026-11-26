import { HttpError } from './http.error';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export class UnprocessableEntityError extends HttpError {
  constructor(message = 'Unprocessable entity') {
    super(message, 422);
    this.name = 'UnprocessableEntityError';
  }
}
