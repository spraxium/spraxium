import { HttpError } from './http.error';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export class NotImplementedError extends HttpError {
  constructor(message = 'Not implemented') {
    super(message, 501);
    this.name = 'NotImplementedError';
  }
}
