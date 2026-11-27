// Optional local test infrastructure. Does not install Windows services.
import { spawn, spawnSync } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { initdb, pg_ctl, postgres } from '@embedded-postgres/windows-x64';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import { createConnection } from 'mysql2/promise';
import { Client } from 'pg';

const here = path.dirname(fileURLToPath(import.meta.url));
const directory = path.join(here, '.generated', `servers-${Date.now()}`);
const mysqlBase = process.env.ORM_MYSQL_BASEDIR;
if (!mysqlBase) throw new Error('Set ORM_MYSQL_BASEDIR to the extracted official MySQL Windows ZIP');
await mkdir(directory, { recursive: true });
const pgData = path.join(directory, 'postgres');
const mysqlData = path.join(directory, 'mysql');
const passwordFile = path.join(directory, 'postgres-password');
await writeFile(passwordFile, 'template-test');
const mysqld = path.join(mysqlBase, 'bin/mysqld.exe');
const pgLog = createWriteStream(path.join(directory, 'postgres.log'));
const mysqlLog = createWriteStream(path.join(directory, 'mysql.log'));
let pgProcess;
let mysqlProcess;
let mongo;
let mysqlUrl = 'mysql://root@127.0.0.1:53317/mysql';

function command(bin, args) {
  const result = spawnSync(bin, args, { windowsHide: true, encoding: 'utf8', timeout: 120_000 });
  if (result.status !== 0)
    throw new Error(`${bin}: ${result.error ?? ''}\n${result.stdout}\n${result.stderr}`);
}

async function waitFor(connect) {
  for (let attempt = 0; attempt < 90; attempt++) {
    try {
      await connect();
      return;
    } catch (error) {
      if (attempt === 89) throw error;
      await delay(1000);
    }
  }
}

try {
  console.log('Initializing disposable PostgreSQL');
  command(initdb, [
    '-D',
    pgData,
    '-U',
    'spraxium',
    '--pwfile',
    passwordFile,
    '--auth=scram-sha-256',
    '--encoding=UTF8',
    '--locale=C',
  ]);
  pgProcess = spawn(postgres, ['-D', pgData, '-p', '55437', '-h', '127.0.0.1'], { windowsHide: true });
  pgProcess.stdout.pipe(pgLog);
  pgProcess.stderr.pipe(pgLog);
  const postgresUrl = 'postgresql://spraxium:template-test@127.0.0.1:55437/postgres';
  await waitFor(async () => {
    const client = new Client({ connectionString: postgresUrl });
    try {
      await client.connect();
    } finally {
      await client.end();
    }
  });

  console.log('Initializing disposable MySQL');
  command(mysqld, [
    '--no-defaults',
    '--initialize-insecure',
    `--basedir=${mysqlBase}`,
    `--datadir=${mysqlData}`,
  ]);
  mysqlProcess = spawn(
    mysqld,
    [
      '--no-defaults',
      `--basedir=${mysqlBase}`,
      `--datadir=${mysqlData}`,
      '--bind-address=127.0.0.1',
      '--port=53317',
      '--mysqlx=OFF',
      '--console',
    ],
    { windowsHide: true },
  );
  mysqlProcess.stdout.pipe(mysqlLog);
  mysqlProcess.stderr.pipe(mysqlLog);
  await waitFor(async () => {
    const connection = await createConnection(mysqlUrl);
    await connection.end();
  });
  const administrator = await createConnection(mysqlUrl);
  await administrator.query("ALTER USER 'root'@'localhost' IDENTIFIED BY 'template-test'");
  await administrator.end();
  mysqlUrl = 'mysql://root:template-test@127.0.0.1:53317/mysql';

  console.log('Starting disposable MongoDB');
  mongo = await MongoMemoryServer.create({
    binary: { version: '8.0.17', downloadDir: path.join(here, '.generated/tools/mongodb') },
    instance: { ip: '127.0.0.1', port: 57027 },
    spawn: { windowsHide: true },
  });
  console.log('All three database servers are ready');
  const child = spawn(process.execPath, ['--import', '../../packages/cli/dist/swc.loader.js', 'run.mjs'], {
    cwd: here,
    stdio: 'inherit',
    windowsHide: true,
    env: {
      ...process.env,
      ORM_POSTGRES_URL: postgresUrl,
      ORM_MYSQL_URL: mysqlUrl,
      ORM_MONGO_URL: mongo.getUri(),
    },
  });
  process.exitCode = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code) => resolve(code ?? 1));
  });
} finally {
  console.log('Stopping disposable database servers');
  await mongo?.stop();
  if (mysqlProcess) {
    try {
      const connection = await createConnection(mysqlUrl);
      await connection.query('SHUTDOWN');
      await connection.end();
    } catch {
      mysqlProcess.kill();
    }
  }
  if (pgProcess) command(pg_ctl, ['-D', pgData, 'stop', '-m', 'fast', '-w']);
  pgLog.end();
  mysqlLog.end();
}
