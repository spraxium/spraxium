import { HttpError } from './http.error';

export class BadRequestError extends HttpError {
  constructor(message = 'Bad request') {
    super(message, 400);
    this.name = 'BadRequestError';
  }
}
