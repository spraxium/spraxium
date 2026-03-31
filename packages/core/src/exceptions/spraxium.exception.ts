import type { SpraxiumExceptionOptions } from './interfaces';
import type { ExceptionLayoutClass } from './types';

/**
 * Base class for all Spraxium exceptions.
 *
 * Extend this to create typed, domain-specific exceptions that plug into
 * the automatic exception handler, layout resolution, and placeholder engine.
 *
 * @example
 * export class CooldownException extends SpraxiumException {
 *   constructor(props?: { seconds?: number }) {
 *     super({ code: 'COOLDOWN', props });
 *   }
 * }
 *
 * // At the throw site , no embed/content logic here:
 * throw new CooldownException({ seconds: 10 });
 */
export class SpraxiumException extends Error {
  public readonly code: string;
  public readonly props: Record<string, unknown>;
  public readonly shouldReply: boolean;
  public readonly shouldLog: boolean;
  public readonly layout?: ExceptionLayoutClass;

  public constructor(options: SpraxiumExceptionOptions) {
    super(options.message ?? options.code);
    this.name = this.constructor.name;
    this.code = options.code;
    this.props = options.props ?? {};
    this.shouldReply = options.shouldReply ?? true;
    this.shouldLog = options.shouldLog ?? false;
    this.layout = options.layout;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
