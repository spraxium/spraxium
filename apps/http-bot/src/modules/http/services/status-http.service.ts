import { Injectable } from '@spraxium/common';
import type { AppEnv } from '../../../app.env';

@Injectable()
export class StatusHttpService {
  constructor(private readonly env: AppEnv) {}

  getStatus(): object {
    return {
      status: 'ok',
      uptime: process.uptime(),
      port: this.env.port,
    };
  }
}
