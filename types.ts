
export interface Apple {
  id: number;
  x: number; // percentage from left
  y: number; // percentage from top
  speed: number;
}

export type GameState = 'start' | 'playing' | 'gameOver';
