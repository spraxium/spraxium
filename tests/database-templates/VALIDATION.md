# ORM template validation

The template matrix was checked with Node 26.12.1 on Windows, using PostgreSQL 18.4, MySQL 8.4.13, MongoDB 8.0.17 and SQLite through each ORM's native driver. All 13 combinations passed generation, configuration type checking, application build, schema setup, CRUD and connection shutdown through dependency injection. Both the development loader and the production bundle were exercised.

| Integration | Databases | Result |
| --- | --- | --- |
| Prisma 7.10.1 | PostgreSQL, MySQL, SQLite | Passed |
| Drizzle 0.45.4 / Kit 0.31.11 | PostgreSQL, MySQL, SQLite | Passed |
| TypeORM 1.1.3 | PostgreSQL, MySQL, SQLite | Passed |
| MikroORM 7.2.12 | PostgreSQL, MySQL, SQLite | Passed |
| Mongoose 9.13.1 | MongoDB | Passed |

The framework build, typecheck and 329 unit tests also passed. Lint completed with existing warnings outside these changes. CI runs the integration matrix on Linux across the three supported Node release lines; the local run does not replace those platform checks.

## Corrections

Prisma MySQL used an older client option and schema syntax, and listed a type package that does not exist. It now uses the MariaDB driver adapter required by Prisma 7. The registry keeps the CLI, client and adapters on the same stable release line instead of resolving the current Prisma `latest` tag to a release candidate.

Drizzle configurations now declare their environment loader, and its SQLite service closes the native database handle on shutdown. MikroORM now uses driver-specific types, opens the connection explicitly and includes the configuration and packages needed by the documented migration commands. The SQLite driver selected for TypeORM stays within its supported peer range.

The CLI now handles environment schemas in either `src/app.env.ts` or `src/env/app.env.ts`. It preserves existing database fields, recognizes decorators with defaults, adds missing imports and safely quotes default values. Nine regression tests cover these behaviors and the dependency contracts for every template.

## Upstream dependency alerts

Compatibility tests passed, but the dependency audit is not clean. Prisma 7.10.1 pins `effect` 3.20.0 through its configuration package, which is affected by [GHSA-7589-6fvf-x4pw](https://github.com/advisories/GHSA-7589-6fvf-x4pw). Drizzle Kit 0.31.11 also brings an older esbuild through its legacy loader, reported by [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99).

These alerts come from upstream development tools used for configuration and migrations. No downgrade or forced transitive major upgrade was applied to silence the audit, since that would change the integrations being validated. They remain follow-up work when the upstream packages update their dependencies or a separately tested override is introduced.
