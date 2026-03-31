import { HttpError } from './http.error';

export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}
