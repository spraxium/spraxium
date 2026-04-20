import { Injectable } from '@spraxium/common';
import { desc, sql } from 'drizzle-orm';
import * as schema from '../db/schema';
import { DrizzleConnectionService } from './drizzle-connection.service';

@Injectable()
export class DrizzlePostgresService {
  constructor(private readonly connection: DrizzleConnectionService) {}

  async ping(): Promise<number> {
    const db = this.connection.getDb();
    const start = Date.now();

    await db.execute(sql`select 1`);

    return Date.now() - start;
  }

  async addCheck(input: {
    userId: string;
    guildId: string | null;
    note: string;
  }): Promise<schema.SandboxDbCheck> {
    const db = this.connection.getDb();
    const latencyMs = await this.ping();

    const [row] = await db
      .insert(schema.sandboxDbChecks)
      .values({
        userId: input.userId,
        guildId: input.guildId,
        note: input.note,
        latencyMs,
      })
      .returning();

    return row;
  }

  async listRecent(limit: number): Promise<Array<schema.SandboxDbCheck>> {
    const db = this.connection.getDb();

    return db
      .select()
      .from(schema.sandboxDbChecks)
      .orderBy(desc(schema.sandboxDbChecks.createdAt))
      .limit(limit);
  }
}
