export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface LeaderboardData {
  title: string;
  players: ReadonlyArray<Player>;
}

export const PLAYERS: ReadonlyArray<Player> = [
  { id: 'p01', name: 'Aria', score: 12_540 },
  { id: 'p02', name: 'Brennan', score: 11_815 },
  { id: 'p03', name: 'Cleo', score: 10_902 },
  { id: 'p04', name: 'Diego', score: 10_201 },
  { id: 'p05', name: 'Esme', score: 9_745 },
  { id: 'p06', name: 'Fenwick', score: 9_100 },
  { id: 'p07', name: 'Greta', score: 8_603 },
  { id: 'p08', name: 'Hideo', score: 8_190 },
];
