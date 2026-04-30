---
"@spraxium/components": patch
---

Allow `rowData` in `@V2Row` to be a factory function `(data) => value`, so you can derive select data from the container's runtime data without wrapping in `@V2Dynamic`.
