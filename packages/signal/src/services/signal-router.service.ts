import { Injectable } from '@spraxium/common';
import type { SignalHandler } from '../interfaces';

@Injectable()
export class SignalRouter {
  private readonly handlers = new Map<string, SignalHandler>();

  register(event: string, handler: SignalHandler): void {
    this.handlers.set(event, handler);
  }

  has(event: string): boolean {
    return this.handlers.has(event);
  }

  resolve(event: string): SignalHandler | undefined {
    return this.handlers.get(event);
  }

  events(): ReadonlySet<string> {
    return new Set(this.handlers.keys());
  }
}
