import type { ColorResolvable } from 'discord.js';
import { Colors } from '../constants';

/**
 * Converts a color value to a `ColorResolvable` accepted by discord.js.
 * Accepts a hex number or a hex string with or without `#`.
 */
export class ColorResolver {
  static resolve(color: number | string): ColorResolvable {
    if (typeof color === 'number') return color as ColorResolvable;
    const hex = color.startsWith('#') ? color : `#${color}`;
    return hex as ColorResolvable;
  }

  /**
   * Picks the first color whose threshold is above `value`, or returns `fallback`.
   * @example stepColor(ws, [{ threshold: 100, color: Colors.Green }], Colors.Red)
   */
  static step(value: number, steps: Array<{ threshold: number; color: number }>, fallback: number): number {
    for (const step of steps) {
      if (value < step.threshold) return step.color;
    }
    return fallback;
  }

  /**
   * Returns gold/silver/bronze/blue based on leaderboard rank (1/2/3/other).
   */
  static rank(rank: number): number {
    if (rank === 1) return Colors.Gold;
    if (rank === 2) return Colors.Silver;
    if (rank === 3) return Colors.Bronze;
    return Colors.Blue;
  }
}
