import type { AutoDeferOptions } from '@spraxium/common';
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction } from 'discord.js';

type PatchableInteraction = ChatInputCommandInteraction | ContextMenuCommandInteraction;

/**
 * Installs the AutoDefer behaviour on a Discord interaction.
 *
 * - Starts a timer for `options.threshold` ms (default 2000).
 * - Patches `interaction.reply()` so the handler can always call it safely:
 *   if the timer fired first and the interaction was deferred, the patch
 *   transparently forwards the call to `interaction.editReply()`.
 * - If the handler replies before the threshold, the timer is cancelled and
 *   Discord never shows "Thinking...".
 *
 * Returns a `cleanup` function that **must** be called (via `finally`) after
 * the handler resolves to cancel the timer and restore the original method.
 */
export function installAutoDefer(interaction: PatchableInteraction, options: AutoDeferOptions): () => void {
  const threshold = options.threshold ?? 2000;
  let deferred = false;
  let deferPromise: Promise<unknown> | null = null;

  // biome-ignore lint/suspicious/noExplicitAny: patching discord.js interaction at runtime
  const originalReply = (interaction.reply as (...args: Array<any>) => unknown).bind(interaction);

  // biome-ignore lint/suspicious/noExplicitAny: patch requires any
  (interaction as any).reply = async (replyOptions: unknown) => {
    if (deferred) {
      if (deferPromise) await deferPromise;
      return interaction.editReply(replyOptions as Parameters<typeof interaction.editReply>[0]);
    }
    return originalReply(replyOptions);
  };

  const timer = setTimeout(() => {
    deferred = true;
    deferPromise = interaction.deferReply({ ephemeral: options.ephemeral ?? false });
  }, threshold);

  return () => {
    clearTimeout(timer);
    // biome-ignore lint/suspicious/noExplicitAny: restoring patched method
    (interaction as any).reply = originalReply;
  };
}
