import { HttpController, HttpCtx, HttpGet } from '@spraxium/http';
import type { Context } from 'hono';
import type { StatusHttpService } from '../services/status-http.service';

@HttpController('/status')
export class StatusController {
  constructor(private readonly statusService: StatusHttpService) {}

  @HttpGet('/')
  async index(@HttpCtx() ctx: Context): Promise<Response> {
    const data = this.statusService.getStatus();
    return ctx.json(data);
  }
}
