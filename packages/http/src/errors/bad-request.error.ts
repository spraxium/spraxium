import { HttpError } from './http.error';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export class BadRequestError extends HttpError {
  constructor(message = 'Bad request') {
    super(message, 400);
    this.name = 'BadRequestError';
  }
}
