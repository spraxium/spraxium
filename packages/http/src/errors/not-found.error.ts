import { HttpError } from './http.error';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export class NotFoundError extends HttpError {
  constructor(message = 'Not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}
