import { SlashCommand } from '@spraxium/common';

@SlashCommand({ name: 'ping', description: 'Replies with pong and WebSocket latency.' })
export class PingCommand {
  build() {}
}
