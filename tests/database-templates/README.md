# Database template tests

These tests generate a project from each database template, register its module, and check the code that a user actually receives. The matrix covers Prisma, Drizzle, TypeORM and MikroORM with PostgreSQL, MySQL and SQLite, plus Mongoose with MongoDB: 13 combinations.

Each case checks environment patching, TypeScript (including the ORM configuration), `spraxium build`, schema creation or migrations, dependency injection, CRUD and connection shutdown. The runtime checks run twice: once through the development loader and once through `spraxium start` with the compiled bundle. No Discord login or bot token is required.

## Run the matrix

Build the framework and install the isolated test dependencies from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm run build
npm ci --prefix tests/database-templates
```

The test dependencies have their own lockfile so the workspace cannot silently replace a database driver with an incompatible major version. Use a Node version supported by the framework. SQLite requires a working native `better-sqlite3` binary.

Start the disposable databases, then run the suite from this directory:

```sh
docker compose -p spraxium-orm-validation up -d --wait
ORM_POSTGRES_URL=postgresql://spraxium:template-test@127.0.0.1:55437/spraxium \
ORM_MYSQL_URL=mysql://root:template-test@127.0.0.1:53317/spraxium \
ORM_MONGO_URL=mongodb://127.0.0.1:57027/spraxium \
npm test
docker compose -p spraxium-orm-validation down -v
```

Use disposable servers: the runner creates a separate database for each combination and leaves the databases there for inspection until the containers are removed. The credentials in the example belong only to these local test containers.

Without Docker, `portable-windows.mjs` starts PostgreSQL and MongoDB from the test dependencies and an official MySQL Windows ZIP supplied through `ORM_MYSQL_BASEDIR`. It does not install Windows services. For example, in PowerShell:

```powershell
$env:ORM_MYSQL_BASEDIR = 'C:/tools/mysql-8.4.13-winx64'
node portable-windows.mjs
```

For a smaller run, set `ORM_FILTER=sqlite`, `ORM_FILTER=prisma` or `ORM_FILTER=prisma/mysql`. Missing server URLs are reported as skipped runtime checks and cause the suite to fail. Generated projects and server logs stay in `.generated/`; `results.json` records the last run. Neither is committed.

## Compatibility references

The registry keeps Prisma CLI, client and adapters on the same stable release line. MikroORM core, drivers, CLI and migrations also share one release line. Other drivers stay within the major versions accepted by their ORM peers.

- [Prisma 7 upgrade guide](https://docs.prisma.io/docs/guides/upgrade-prisma-orm/v7)
- [Drizzle database setup](https://orm.drizzle.team/docs/get-started)
- [TypeORM 1 upgrade guide](https://dev.typeorm.io/docs/releases/1.0/upgrading-from-0.3/)
- [MikroORM 7 upgrade guide](https://mikro-orm.io/docs/upgrading-v6-to-v7)
- [MikroORM migrations](https://mikro-orm.io/docs/migrations)
- [Mongoose 9 migration guide](https://mongoosejs.com/docs/migrating_to_9.html)
