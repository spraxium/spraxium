import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { Injectable } from '@spraxium/common';
import { logger } from '@spraxium/logger';
import type { Ticket, TicketId, TicketsFile } from './tickets.data';

const DEFAULT_DB_PATH = resolve(process.cwd(), '.spraxium', 'tickets.json');

/**
 * Tiny JSON-backed repository for tickets. Reads are cached in memory; every
 * mutation rewrites the JSON file atomically (write + replace). Sufficient for
 * a single-process demo bot.
 */
@Injectable()
export class TicketsRepository {
  private readonly log = logger.child('TicketsRepository');
  private readonly dbPath = DEFAULT_DB_PATH;
  private cache: TicketsFile | undefined;
  private writeQueue: Promise<void> = Promise.resolve();

  async list(): Promise<ReadonlyArray<Ticket>> {
    const file = await this.load();
    return file.tickets;
  }

  async get(id: TicketId): Promise<Ticket | undefined> {
    const file = await this.load();
    return file.tickets.find((t) => t.id === id);
  }

  async create(input: { subject: string; openedBy: string }): Promise<Ticket> {
    const ticket: Ticket = {
      id: `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      subject: input.subject,
      openedBy: input.openedBy,
      openedAt: Date.now(),
      assignRefs: [],
    };
    await this.mutate((file) => {
      file.tickets.push(ticket);
    });
    return ticket;
  }

  async assign(id: TicketId, userId: string): Promise<Ticket | undefined> {
    let updated: Ticket | undefined;
    await this.mutate((file) => {
      const target = file.tickets.find((t) => t.id === id);
      if (!target) return;
      target.assignedTo = userId;
      updated = target;
    });
    return updated;
  }

  async addAssignRef(id: TicketId, ref: string): Promise<void> {
    await this.mutate((file) => {
      const target = file.tickets.find((t) => t.id === id);
      if (!target) return;
      if (!target.assignRefs.includes(ref)) target.assignRefs.push(ref);
    });
  }

  /** Removes the ticket and returns the assign refs it minted (for revocation). */
  async remove(id: TicketId): Promise<string[]> {
    let refs: string[] = [];
    await this.mutate((file) => {
      const idx = file.tickets.findIndex((t) => t.id === id);
      if (idx === -1) return;
      refs = file.tickets[idx].assignRefs.slice();
      file.tickets.splice(idx, 1);
    });
    return refs;
  }

  private async load(): Promise<TicketsFile> {
    if (this.cache) return this.cache;
    try {
      const raw = await readFile(this.dbPath, 'utf8');
      const parsed = JSON.parse(raw) as Partial<TicketsFile>;
      this.cache = { tickets: Array.isArray(parsed.tickets) ? parsed.tickets : [] };
    } catch (err) {
      if (this.isMissing(err)) {
        this.cache = { tickets: [] };
      } else {
        throw err;
      }
    }
    return this.cache;
  }

  private async mutate(apply: (file: TicketsFile) => void): Promise<void> {
    const file = await this.load();
    apply(file);
    await this.persist(file);
  }

  private persist(file: TicketsFile): Promise<void> {
    // Serialize writes so concurrent button clicks don't clobber the file.
    this.writeQueue = this.writeQueue.then(async () => {
      try {
        await mkdir(dirname(this.dbPath), { recursive: true });
        await writeFile(this.dbPath, JSON.stringify(file, null, 2), 'utf8');
      } catch (err) {
        this.log.error(`Failed to persist tickets DB: ${err instanceof Error ? err.message : String(err)}`);
        throw err;
      }
    });
    return this.writeQueue;
  }

  private isMissing(err: unknown): boolean {
    return typeof err === 'object' && err !== null && (err as { code?: string }).code === 'ENOENT';
  }
}
