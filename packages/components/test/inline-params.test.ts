import 'reflect-metadata';
import type { Client } from 'discord.js';
import { describe, expect, it } from 'vitest';
import { DynamicButton, DynamicButtonHandler } from '../src/components/button';
import { ButtonParams } from '../src/decorators/button-params.decorator';
import { ButtonDispatcher } from '../src/runtime/dispatcher/components/button.dispatcher';
import {
  type InlineParams,
  decodeInlineParams,
  encodeInlineParams,
  joinCustomId,
} from '../src/runtime/dispatcher/helpers/split-custom-id.helper';

const SNOWFLAKE = '1541331179284987915';

describe('inline params coercion', () => {
  it('keeps a 19-digit Discord snowflake as an exact string through encode/decode', () => {
    const encoded = encodeInlineParams({ userId: SNOWFLAKE, guildId: '987654321098765432' });
    const decoded = decodeInlineParams(encoded);

    expect(decoded).toEqual({ userId: SNOWFLAKE, guildId: '987654321098765432' });
    expect(typeof decoded?.userId).toBe('string');
  });

  it('still coerces numbers and booleans that round-trip losslessly', () => {
    const decoded = decodeInlineParams(
      encodeInlineParams({ page: 3, ratio: 0.5, neg: -12, on: true, off: false }),
    );
    expect(decoded).toEqual({ page: 3, ratio: 0.5, neg: -12, on: true, off: false });
  });

  it('keeps the largest safe integer numeric and anything above it as a string', () => {
    const max = String(Number.MAX_SAFE_INTEGER);
    const above = '9007199254740993';
    expect(decodeInlineParams(`a=${max}&b=${above}`)).toEqual({ a: Number.MAX_SAFE_INTEGER, b: above });
  });

  it('does not reinterpret non-canonical numeric strings', () => {
    expect(decodeInlineParams('a=007&b=1e3&c=1.50&d=%201')).toEqual({
      a: '007',
      b: '1e3',
      c: '1.50',
      d: ' 1',
    });
  });
});

describe('@DynamicButtonHandler @ButtonParams', () => {
  it('delivers a snowflake param to the handler without precision loss', async () => {
    @DynamicButton({ baseId: 'ban', encoding: 'inline' })
    class BanButton {}

    let received: InlineParams | undefined;

    @DynamicButtonHandler(BanButton)
    class BanHandler {
      handle(@ButtonParams() params: InlineParams): void {
        received = params;
      }
    }

    const dispatcher = new ButtonDispatcher();
    dispatcher.registerStatic(BanHandler, new BanHandler());

    let listener: ((interaction: unknown) => void) | undefined;
    dispatcher.bind({
      on: (_event: string, cb: (interaction: unknown) => void) => {
        listener = cb;
      },
    } as unknown as Client);

    const customId = joinCustomId('ban', { inlineParams: encodeInlineParams({ userId: SNOWFLAKE }) });
    listener?.({ isButton: () => true, customId, user: { id: '1' } });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(received).toEqual({ userId: SNOWFLAKE });
  });
});
