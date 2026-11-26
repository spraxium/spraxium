import { HttpError } from './http.error';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export class MethodNotAllowedError extends HttpError {
  constructor(message = 'Method not allowed') {
    super(message, 405);
    this.name = 'MethodNotAllowedError';
  }
}
