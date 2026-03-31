import { HttpError } from './http.error';

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}
