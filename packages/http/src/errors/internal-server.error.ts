import { HttpError } from './http.error';

export class InternalServerError extends HttpError {
  constructor(message = 'Internal server error') {
    super(message, 500);
    this.name = 'InternalServerError';
  }
}
