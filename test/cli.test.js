import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

test('CLI help prints inspect usage', async () => {
  const { stdout } = await execFileAsync('node', ['bin/plainforge.js', '--help']);
  assert.match(stdout, /plainforge inspect/);
});

test('CLI convert reads a local fixture file', async () => {
  const { stdout } = await execFileAsync('node', ['bin/plainforge.js', 'convert', 'fixtures/sample/basic-link/input.html']);
  assert.match(stdout, /Plainforge turns HTML into reviewable text/);
});

test('CLI inspect writes a report', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'plainforge-cli-'));
  try {
    const { stdout } = await execFileAsync('node', ['bin/plainforge.js', 'inspect', 'fixtures/sample', '--output', dir]);
    assert.match(stdout, /3 passed, 0 failed/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
