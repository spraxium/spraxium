import { HttpController, HttpGet, HttpPost, HttpParam, HttpBody } from '@spraxium/http';
import { AddPointsDto } from '../dto/add-points.dto';
import { LeaderboardHttpService } from '../services/leaderboard-http.service';

@HttpController('/leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboard: LeaderboardHttpService) {}

  @HttpGet()
  getTop() {
    return this.leaderboard.getTop(10);
  }

  @HttpGet('/:limit')
  getTopN(@HttpParam('limit') limit: string) {
    return this.leaderboard.getTop(Number(limit));
  }

  @HttpPost('/points')
  addPoints(@HttpBody(AddPointsDto) body: AddPointsDto) {
    this.leaderboard.addPoints(body.userId, body.points);
    return { ok: true };
  }
}
