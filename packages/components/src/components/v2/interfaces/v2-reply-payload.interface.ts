import type { ContainerBuilder } from 'discord.js';

export interface V2ReplyPayload {
  components: Array<ContainerBuilder>;
  flags: number;
}
