---
"@spraxium/schedule": patch
---

Give every Redis lock acquisition its own ownership token and release with compare-and-delete against that token, so an invocation that outlived its TTL can no longer release a newer lease acquired by the same process. `ScheduleDriver.acquireLock()` may now resolve to a string token, which the scheduler passes back to `releaseLock(jobName, token)`; existing drivers returning `boolean` keep working. Lock acquisition and release failures are now logged instead of escaping as unhandled rejections. Documents that the lock provides mutual exclusion, not per-occurrence deduplication.
