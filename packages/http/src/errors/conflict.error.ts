import { HttpError } from './http.error';

export class ConflictError extends HttpError {
  constructor(message = 'Conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}
