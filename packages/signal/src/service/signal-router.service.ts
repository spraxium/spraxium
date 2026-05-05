import { Injectable } from '@spraxium/common';
import type { SignalHandler } from '../interfaces';

@Injectable()
export class SignalRouter {
  private readonly handlers = new Map<string, SignalHandler[]>();

  register(event: string, handler: SignalHandler): void {
    const existing = this.handlers.get(event);
    if (existing) {
      existing.push(handler);
    } else {
      this.handlers.set(event, [handler]);
    }
  }

  has(event: string): boolean {
    return this.handlers.has(event);
  }

  /** Returns the first registered handler for an event, or `undefined` if none. */
  resolve(event: string): SignalHandler | undefined {
    return this.handlers.get(event)?.[0];
  }

  /** Returns all handlers registered for an event. */
  resolveAll(event: string): ReadonlyArray<SignalHandler> {
    return this.handlers.get(event) ?? [];
  }

  events(): ReadonlySet<string> {
    return new Set(this.handlers.keys());
  }
}
