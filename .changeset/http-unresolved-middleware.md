---
"@spraxium/http": patch
---

Fail startup when a middleware declared with `@HttpUseMiddleware()` cannot be resolved. Previously unresolved middleware was filtered out silently, so a route could appear protected while its authentication, validation or throttling middleware never ran. Middleware is resolved from `middlewareProviders`, then from instances already resolved for the HTTP module, then from the core container; otherwise boot throws an error naming the controller, handler, route and middleware.
