import { Injectable } from '@spraxium/common';
import { LeaderboardService } from '../../../services/leaderboard.service';

@Injectable()
export class LeaderboardHttpService {
  constructor(private readonly leaderboard: LeaderboardService) {}

  getTop(limit: number) {
    return this.leaderboard.getTop(limit);
  }

  addPoints(userId: string, points: number): void {
    this.leaderboard.addPoints(userId, points);
  }
}
