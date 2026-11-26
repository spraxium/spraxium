import { HttpError } from './http.error';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export class ServiceUnavailableError extends HttpError {
  constructor(message = 'Service unavailable') {
    super(message, 503);
    this.name = 'ServiceUnavailableError';
  }
}
