---
'@spraxium/cli': patch
'@spraxium/http': minor
---

Mark `@spraxium/http` as deprecated in the CLI, package documentation, and public API. Existing HTTP projects can move one route at a time by keeping the route and user authorization in their web framework and moving the call to the bot behind an RPC handler. The legacy server also updates its Hono dependency. See the [migration guide](https://spraxium.com/en/guide/rpc-http-migration).
