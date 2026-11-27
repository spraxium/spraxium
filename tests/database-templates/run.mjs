import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, readFile, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DatabaseTemplateService } from '../../packages/cli/src/service/database-template.service.ts';
import { FileSystem } from '../../packages/cli/src/service/file-system.service.ts';
import { ModuleRegistrar } from '../../packages/cli/src/service/module-registrar.service.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const cli = path.join(root, 'packages/cli/dist/index.js');
const loader = pathToFileURL(path.join(root, 'packages/cli/dist/swc.loader.js')).href;
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const generated = path.join(here, '.generated', runId);
const service = new DatabaseTemplateService();
const registrar = new ModuleRegistrar(new FileSystem());
const index = await service.loadIndex(root);
const results = [];
const filter = process.env.ORM_FILTER;

function run(cwd, executable, args, env = {}) {
  const result = spawnSync(executable, args, {
    cwd,
    encoding: 'utf8',
    timeout: 120_000,
    windowsHide: true,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PATH: `${path.join(here, 'node_modules/.bin')}${path.delimiter}${path.join(root, 'node_modules/.bin')}${path.delimiter}${process.env.PATH}`,
      ...env,
    },
  });
  if (result.status !== 0)
    throw new Error(
      `${executable} ${args.join(' ')}\n${result.error ?? ''}\n${result.stdout}\n${result.stderr}`,
    );
  return result.stdout;
}

async function dbEnvironment(db, cwd, orm) {
  const sqlitePath = path.join(cwd, 'test.db').replaceAll('\\', '/');
  if (db === 'sqlite') return { DATABASE_PATH: sqlitePath, DATABASE_URL: `file:${sqlitePath}` };
  const key = { postgresql: 'ORM_POSTGRES_URL', mysql: 'ORM_MYSQL_URL', mongodb: 'ORM_MONGO_URL' }[db];
  if (!process.env[key]) return { DATABASE_URL: '' };
  const url = new URL(process.env[key]);
  const database = `spraxium_${orm.replaceAll('-', '')}_${Date.now()}`;
  if (db === 'postgresql') {
    const { Client } = await import('pg');
    const client = new Client({ connectionString: url.href });
    await client.connect();
    try {
      await client.query(`CREATE DATABASE "${database}"`);
    } finally {
      await client.end();
    }
  } else if (db === 'mysql') {
    const { createConnection } = await import('mysql2/promise');
    const connection = await createConnection(url.href);
    try {
      await connection.query(`CREATE DATABASE \`${database}\``);
    } finally {
      await connection.end();
    }
  }
  url.pathname = `/${database}`;
  return { DATABASE_URL: url.href };
}

function smokeSource(orm) {
  const imports = {
    prisma: '',
    drizzle: "import { eq } from 'drizzle-orm';\nimport { users } from './modules/storage/schema';",
    typeorm: "import { User } from './modules/storage/entities/user.entity';",
    'mikro-orm': "import { User } from './modules/storage/entities/user.entity';",
    mongoose: "import { UserModel } from './modules/storage/schemas/user.schema';",
  }[orm];
  const crud = {
    prisma: `const created = await db.user.create({ data: input });
      assert.equal((await db.user.findUniqueOrThrow({ where: { id: created.id } })).username, input.username);
      await db.user.update({ where: { id: created.id }, data: { username: 'updated' } });
      assert.equal((await db.user.findUniqueOrThrow({ where: { id: created.id } })).username, 'updated');
      await db.user.delete({ where: { id: created.id } });
      assert.equal(await db.user.count({ where: { id: created.id } }), 0);`,
    drizzle: `const query = db.getDb();
      const id = crypto.randomUUID();
      await query.insert(users).values({ id, ...input });
      assert.equal((await query.select().from(users).where(eq(users.id, id)))[0].username, input.username);
      await query.update(users).set({ username: 'updated' }).where(eq(users.id, id));
      assert.equal((await query.select().from(users).where(eq(users.id, id)))[0].username, 'updated');
      await query.delete(users).where(eq(users.id, id));
      assert.equal((await query.select().from(users).where(eq(users.id, id))).length, 0);`,
    typeorm: `const repository = db.dataSource.getRepository(User);
      const created = await repository.save(repository.create(input));
      assert.equal((await repository.findOneByOrFail({ id: created.id })).username, input.username);
      await repository.update(created.id, { username: 'updated' });
      assert.equal((await repository.findOneByOrFail({ id: created.id })).username, 'updated');
      await repository.delete(created.id);
      assert.equal(await repository.countBy({ id: created.id }), 0);`,
    'mikro-orm': `const em = db.em;
      const created = em.create(User, input);
      await em.persist(created).flush();
      em.clear();
      assert.equal((await em.findOneOrFail(User, { id: created.id })).username, input.username);
      await em.nativeUpdate(User, { id: created.id }, { username: 'updated' });
      em.clear();
      assert.equal((await em.findOneOrFail(User, { id: created.id })).username, 'updated');
      await em.nativeDelete(User, { id: created.id });
      assert.equal(await em.count(User, { id: created.id }), 0);`,
    mongoose: `const created = await UserModel.create(input);
      assert.equal((await UserModel.findById(created.id).orFail()).username, input.username);
      await UserModel.updateOne({ _id: created._id }, { username: 'updated' });
      assert.equal((await UserModel.findById(created.id).orFail()).username, 'updated');
      await UserModel.deleteOne({ _id: created._id });
      assert.equal(await UserModel.countDocuments({ _id: created._id }), 0);`,
  }[orm];
  return `import 'reflect-metadata';
import assert from 'node:assert/strict';
import { Module } from '@spraxium/common';
import { ModuleLoader } from '@spraxium/core';
import { Client } from 'discord.js';
import { AppEnv } from './app.env';
import { AppModule } from './app.module';
import { StorageService } from './modules/storage/storage.service';
${imports}

@Module({ imports: [AppModule], exports: [StorageService] })
class TestModule {}

const env = Object.assign(new AppEnv(), process.env, {
  nodeEnv: process.env.NODE_ENV === 'production' ? 'production' : 'development',
});
const client = new Client({ intents: [] });
const modules = new ModuleLoader();
modules.load(TestModule, client, new Map([[AppEnv, env]]));
const db = modules.getContainer().get<StorageService>(StorageService);
assert.ok(db, 'The CLI-generated module must export its service through DI');
try {
  await modules.runBootHooks();
  const input = { discordId: String(Date.now()), username: 'template-test' };
  ${crud}
  console.log('CRUD_OK');
} finally {
  // Invoke directly as well: the framework shutdown runner intentionally settles errors.
  await db.onShutdown();
  await modules.runShutdownHooks();
  await client.destroy();
}
console.log('SHUTDOWN_OK');
`;
}

await mkdir(generated, { recursive: true });
await mkdir(path.join(here, 'node_modules/@spraxium'), { recursive: true });
for (const pkg of ['common', 'core', 'env', 'logger']) {
  try {
    await symlink(
      path.join(root, 'packages', pkg),
      path.join(here, 'node_modules/@spraxium', pkg),
      'junction',
    );
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
}
try {
  await symlink(
    path.join(root, 'packages/core/node_modules/discord.js'),
    path.join(here, 'node_modules/discord.js'),
    'junction',
  );
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
}

for (const orm of index)
  for (const db of orm.databases) {
    const name = `${orm.id}/${db.id}`;
    if (filter && !name.includes(filter)) continue;
    const result = { name, passed: [], status: 'running' };
    results.push(result);
    const cwd = path.join(generated, orm.id, db.id);
    console.log(`TEST ${name}`);
    try {
      await cp(path.join(root, 'templates/default'), cwd, { recursive: true });
      const dependencyMap = (packages) =>
        Object.fromEntries(
          packages.map((pkg) => {
            const at = pkg.lastIndexOf('@');
            return at > 0 ? [pkg.slice(0, at), pkg.slice(at + 1)] : [pkg, '*'];
          }),
        );
      await writeFile(
        path.join(cwd, 'package.json'),
        JSON.stringify({
          name: `test-${orm.id}-${db.id}`,
          private: true,
          type: 'module',
          dependencies: dependencyMap(db.runtimePackages),
          devDependencies: dependencyMap(db.devPackages),
        }),
      );
      await service.install({
        orm: orm.id,
        db: db.id,
        moduleName: 'storage',
        pascalName: 'Storage',
        srcDir: path.join(cwd, 'src'),
        projectRoot: cwd,
        monorepoRoot: root,
      });
      assert.equal(await service.patchAppEnv(path.join(cwd, 'src'), db.envKeys), true);
      assert.equal(
        await service.patchAppEnv(path.join(cwd, 'src'), db.envKeys),
        false,
        'env patch must be idempotent',
      );
      await registrar.register(
        path.join(cwd, 'src/app.module.ts'),
        'StorageModule',
        './modules/storage/storage.module',
        'imports',
      );
      // Re-export only for the integration probe; the generated import is unchanged.
      const appModule = await readFile(path.join(cwd, 'src/app.module.ts'), 'utf8');
      await writeFile(
        path.join(cwd, 'src/app.module.ts'),
        `import { StorageService } from './modules/storage/storage.service';\n${appModule.replace('@Module({', '@Module({ exports: [StorageService],')}`,
      );
      await writeFile(path.join(cwd, 'src/main.ts'), smokeSource(orm.id));
      const env = await dbEnvironment(db.id, cwd, orm.id);
      await writeFile(
        path.join(cwd, '.env'),
        Object.entries(env)
          .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
          .join('\n'),
      );
      result.passed.push('generate, env patch, module registration');
      for (const command of db.postInstall) {
        const [launcher, tool, ...args] = command.split(' ');
        assert.equal(launcher, 'npx');
        assert.equal(tool, 'prisma');
        run(cwd, process.execPath, [path.join(here, 'node_modules/prisma/build/index.js'), ...args], env);
      }
      // Include external ORM config files in type checking, too.
      const tsconfig = JSON.parse(await readFile(path.join(cwd, 'tsconfig.json'), 'utf8'));
      await writeFile(
        path.join(cwd, 'tsconfig.validation.json'),
        JSON.stringify({
          ...tsconfig,
          compilerOptions: { ...tsconfig.compilerOptions, rootDir: '.', types: ['node'] },
          include: ['src', '*.config.ts'],
        }),
      );
      run(
        cwd,
        process.execPath,
        [path.join(here, 'node_modules/typescript/bin/tsc'), '--noEmit', '-p', 'tsconfig.validation.json'],
        env,
      );
      result.passed.push('typecheck (including ORM configs)');
      run(cwd, process.execPath, [cli, 'build'], env);
      result.passed.push('spraxium build');
      if (db.id !== 'sqlite' && !env.DATABASE_URL) {
        result.status = 'runtime-skipped';
        result.reason = 'No disposable database URL supplied';
      } else {
        if (orm.id === 'prisma')
          run(
            cwd,
            process.execPath,
            [path.join(here, 'node_modules/prisma/build/index.js'), 'migrate', 'dev', '--name', 'init'],
            env,
          );
        if (orm.id === 'drizzle')
          run(
            cwd,
            process.execPath,
            [path.join(here, 'node_modules/drizzle-kit/bin.cjs'), 'push', '--force'],
            env,
          );
        if (orm.id === 'mikro-orm') {
          run(
            cwd,
            process.execPath,
            [path.join(here, 'node_modules/@mikro-orm/cli/cli.js'), 'migration:create', '--initial'],
            env,
          );
          run(
            cwd,
            process.execPath,
            [path.join(here, 'node_modules/@mikro-orm/cli/cli.js'), 'migration:up'],
            env,
          );
        }
        result.passed.push('schema setup/migration');
        for (const args of [
          ['--import', loader, 'src/main.ts'],
          [cli, 'start'],
        ]) {
          const stdout = run(cwd, process.execPath, args, {
            ...env,
            NODE_ENV: args[0] === cli ? 'production' : 'development',
          });
          assert.match(stdout, /CRUD_OK/);
          assert.match(stdout, /SHUTDOWN_OK/);
        }
        result.passed.push('DI, boot, CRUD, shutdown: dev + production bundle');
        result.status = 'passed';
      }
    } catch (error) {
      result.status = 'failed';
      result.error = error.message;
      console.error(error.message);
    }
    console.log(`${result.status.toUpperCase()} ${name}`);
    await writeFile(path.join(here, 'results.json'), JSON.stringify({ runId, results }, null, 2));
  }
console.table(results.map(({ name, status, passed }) => ({ name, status, checks: passed.length })));
if (results.some((result) => result.status !== 'passed')) process.exitCode = 1;
