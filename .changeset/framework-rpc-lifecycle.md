---
'@spraxium/common': minor
'@spraxium/core': minor
---

Add module integrations for features that need to follow a bot's lifecycle. The RPC adapter starts the gateway after the bot is ready. In a sharded deployment the parent can host the gateway, forward a guild call to its shard, and drain pending calls when the bot shuts down. See the [RPC guide](https://spraxium.com/en/guide/rpc-overview).
