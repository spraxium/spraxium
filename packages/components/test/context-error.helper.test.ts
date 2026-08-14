import { MessageFlags } from 'discord.js';
import { describe, expect, it } from 'vitest';
import { resolveContextError } from '../src/runtime/dispatcher/helpers/context-error.helper';

describe(resolveContextError.name, () => {
  it('uses interaction flags for ephemeral replies', () => {
    expect(resolveContextError(undefined, 'Expired', true)).toEqual({
      content: 'Expired',
      flags: MessageFlags.Ephemeral,
    });
  });

  it('does not add flags to public replies', () => {
    expect(resolveContextError('Try again', 'Expired', false)).toEqual({
      content: 'Try again',
      flags: undefined,
    });
  });
});
