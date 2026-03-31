import { HttpError } from './http.error';

export class UnprocessableEntityError extends HttpError {
  constructor(message = 'Unprocessable entity') {
    super(message, 422);
    this.name = 'UnprocessableEntityError';
  }
}
