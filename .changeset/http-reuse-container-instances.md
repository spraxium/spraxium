---
"@spraxium/http": patch
---

Reuse instances already owned by the HTTP dependency map or the core container when resolving `@HttpClientModule({ services, guards })`, instead of constructing a duplicate. A provider listed both as an application provider and as an HTTP service is now a single instance with a single lifecycle owner. Unresolved required constructor dependencies now fail startup with a descriptive error (matching the core module loader); mark a parameter `@Optional()` to keep it `undefined`.
