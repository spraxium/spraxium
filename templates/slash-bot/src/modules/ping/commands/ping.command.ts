import { SlashCommand } from '@spraxium/common';

// The simplest possible slash command — no options, no subcommands.
// Handler: PingHandler (@SlashCommandHandler(PingCommand))
@SlashCommand({ name: 'ping', description: 'Replies with pong and WebSocket latency.' })
export class PingCommand {
  build() {}
}
