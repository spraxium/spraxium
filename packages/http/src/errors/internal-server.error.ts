import { HttpError } from './http.error';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export class InternalServerError extends HttpError {
  constructor(message = 'Internal server error') {
    super(message, 500);
    this.name = 'InternalServerError';
  }
}
