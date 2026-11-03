import 'reflect-metadata';
import type { ExecutionContext } from '@spraxium/common';
import { describe, expect, it } from 'vitest';
import { InternalException } from '../src/exceptions/built-in';
import { ExceptionHandler } from '../src/exceptions/exception.handler';
import type { ExceptionLayout, ExceptionLayoutPayload } from '../src/exceptions/interfaces';
import { SpraxiumException } from '../src/exceptions/spraxium.exception';

async function captureNormalized(thrown: unknown): Promise<SpraxiumException> {
  let captured: SpraxiumException | undefined;
  class CaptureLayout implements ExceptionLayout {
    build(exception: SpraxiumException): ExceptionLayoutPayload {
      captured = exception;
      return { content: 'x' };
    }
  }
  const ctx = {
    getCommandName: () => 'test',
    getInteraction: () => ({}),
  } as unknown as ExecutionContext;

  await ExceptionHandler.handle(thrown, ctx, { layouts: { default: CaptureLayout }, logUnhandled: false });
  if (!captured) throw new Error('layout was not invoked');
  return captured;
}

describe('ExceptionHandler.normalize', () => {
  it('keeps the original Error, its stack and cause chain on the wrapped exception', async () => {
    const root = new Error('connection refused');
    const original = new Error('query failed', { cause: root });

    const exception = await captureNormalized(original);

    expect(exception).toBeInstanceOf(InternalException);
    expect(exception.cause).toBe(original);
    expect((exception.cause as Error).stack).toBe(original.stack);
    expect((exception.cause as Error).cause).toBe(root);
    // Template prop stays the plain message for backwards compatibility.
    expect(exception.props.cause).toBe('query failed');
  });

  it('keeps non-Error thrown values as the cause', async () => {
    const exception = await captureNormalized('plain string');
    expect(exception.cause).toBe('plain string');
    expect(exception.props.cause).toBe('plain string');
  });

  it('passes SpraxiumExceptions through unchanged', async () => {
    const own = new SpraxiumException({ code: 'CUSTOM', cause: new Error('inner') });
    const exception = await captureNormalized(own);
    expect(exception).toBe(own);
    expect((exception.cause as Error).message).toBe('inner');
  });
});
