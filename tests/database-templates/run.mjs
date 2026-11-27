import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, readFile, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DatabaseTemplateService } from '../../packages/cli/src/service/database-template.service.ts';
import { FileSystem } from '../../packages/cli/src/service/file-system.service.ts';
import { ModuleRegistrar } from '../../packages/cli/src/service/module-registrar.service.ts';
import { databaseProbe } from './probe-source.mjs';

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
      await writeFile(path.join(cwd, 'src/main.ts'), databaseProbe(orm.id));
      const env = await dbEnvironment(db.id, cwd, orm.id);
      await writeFile(
        path.join(cwd, '.env'),
        Object.entries(env)
          .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
          .join('\n'),
      );
      result.passed.push('scaffold');
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
      result.passed.push('typecheck');
      run(cwd, process.execPath, [cli, 'build'], env);
      result.passed.push('build');
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
        result.passed.push('migrations');
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
        result.passed.push('dev', 'production');
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
