import { readdir, readFile } from 'node:fs/promises';
import { join, basename } from 'node:path';

export async function discoverFixtures(rootDir) {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const fixtures = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dir = join(rootDir, entry.name);
    fixtures.push(await loadFixture(dir));
  }
  return fixtures.sort((a, b) => a.id.localeCompare(b.id));
}

export async function loadFixture(dir) {
  const [html, expected, meta] = await Promise.all([
    readFile(join(dir, 'input.html'), 'utf8'),
    readFile(join(dir, 'expected.txt'), 'utf8'),
    readOptionalJson(join(dir, 'meta.json'))
  ]);
  return {
    id: meta.id ?? basename(dir),
    title: meta.title ?? basename(dir),
    tags: meta.tags ?? [],
    notes: meta.notes ?? '',
    dir,
    html,
    expected: expected.trim()
  };
}

async function readOptionalJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}
