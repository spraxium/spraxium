import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { type IncomingMessage, type ServerResponse, createServer } from 'node:http';
import path from 'node:path';
import { execa } from 'execa';

export class VersionSwitchRegistry {
  private readonly packuments = new Map<string, Readonly<Record<string, unknown>>>();
  private readonly tarballs = new Map<string, Buffer>();
  private readonly server = createServer((request, response) => this.serve(request, response));
  origin = '';

  async start(directory: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.server.once('error', reject);
      this.server.listen(0, '127.0.0.1', resolve);
    });
    const address = this.server.address();
    if (typeof address !== 'object' || !address) throw new Error('Could not start the test registry.');
    this.origin = `http://127.0.0.1:${address.port}/`;

    await Promise.all([this.pack('@spraxium/core', directory), this.pack('@spraxium/cli', directory)]);
  }

  async close(): Promise<void> {
    this.server.closeAllConnections();
    await new Promise<void>((resolve) => this.server.close(() => resolve()));
  }

  private async pack(name: string, directory: string): Promise<void> {
    const versions: Record<string, unknown> = {};
    const time: Record<string, string> = {};
    const baseName = name.replace('@spraxium/', '');
    for (const version of ['0.9.0', '1.0.0-dev.42', '1.0.0-dev.45']) {
      const folder = path.join(directory, baseName, version);
      await mkdir(folder, { recursive: true });
      const manifest = { name, version };
      await writeFile(path.join(folder, 'package.json'), JSON.stringify(manifest));
      const { stdout } = await execa('npm', ['pack', '--json', '--ignore-scripts'], { cwd: folder });
      const [{ filename, integrity, shasum }] = JSON.parse(stdout) as Array<{
        filename: string;
        integrity: string;
        shasum: string;
      }>;
      const archive = await readFile(path.join(folder, filename));
      this.tarballs.set(`/tarballs/${filename}`, archive);
      versions[version] = {
        ...manifest,
        dist: { tarball: `${this.origin}tarballs/${filename}`, integrity, shasum },
      };
      time[version] = '2020-01-01T00:00:00.000Z';
    }

    const broken = '1.0.0-dev.99';
    const integrity = `sha512-${createHash('sha512').update(name).digest('base64')}`;
    versions[broken] = {
      name,
      version: broken,
      dist: { tarball: `${this.origin}missing/${baseName}.tgz`, integrity },
    };
    time[broken] = '2020-01-01T00:00:00.000Z';

    if (baseName === 'core') {
      const partial = '1.0.0-dev.80';
      versions[partial] = { name, version: partial };
      time[partial] = '2020-01-01T00:00:00.000Z';
    }

    this.packuments.set(`/${name}`, {
      name,
      'dist-tags': { latest: '0.9.0', next: '1.0.0-dev.45' },
      versions,
      time,
    });
  }

  private serve(request: IncomingMessage, response: ServerResponse): void {
    const url = decodeURIComponent(request.url ?? '');
    const file = this.tarballs.get(url);
    if (file) {
      response.writeHead(200, { 'content-type': 'application/octet-stream' });
      response.end(file);
      return;
    }

    const metadata = this.packuments.get(url);
    response.writeHead(metadata ? 200 : 404, { 'content-type': 'application/json' });
    response.end(JSON.stringify(metadata ?? { error: 'Not found' }));
  }
}
