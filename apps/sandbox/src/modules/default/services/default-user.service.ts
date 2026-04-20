import { Injectable } from '@spraxium/common';
import { AppEnv } from '../../../app.env';

@Injectable()
export class DefaultUserService {
  constructor(private readonly env: AppEnv) {}
}
