export function databaseProbe(orm) {
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
  // Call the service directly so a shutdown error fails the probe.
  await db.onShutdown();
  await modules.runShutdownHooks();
  await client.destroy();
}
console.log('SHUTDOWN_OK');
`;
}
