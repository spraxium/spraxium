import { IsInt, IsString, Min } from 'class-validator';

export class AddPointsDto {
  @IsString()
  userId: string;

  @IsInt()
  @Min(1)
  points: number;

  constructor() {
    this.userId = '';
    this.points = 0;
  }
}
