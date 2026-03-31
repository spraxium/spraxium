import { HttpError } from './http.error';

export class NotFoundError extends HttpError {
  constructor(message = 'Not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}
