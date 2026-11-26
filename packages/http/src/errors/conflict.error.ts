import { HttpError } from './http.error';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export class ConflictError extends HttpError {
  constructor(message = 'Conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}
