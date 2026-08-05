import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

async function assertCliFailure(args, message) {
  await assert.rejects(
    execFileAsync('node', ['bin/plainforge.js', ...args]),
    (error) => error.code === 1 && message.test(error.stderr)
  );
}

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

test('CLI rejects options that are missing values', async () => {
  await assertCliFailure(['convert', 'fixtures/sample/basic-link/input.html', '--strategy'], /--strategy requires a value/);
  await assertCliFailure(['inspect', 'fixtures/sample', '--output'], /--output requires a value/);
  await assertCliFailure(['inspect', 'fixtures/sample', '-o'], /-o requires a value/);
});

test('CLI rejects unknown options', async () => {
  await assertCliFailure(['convert', 'fixtures/sample/basic-link/input.html', '--verbose'], /unknown option: --verbose/);
});

test('CLI rejects surplus positional arguments for every command', async () => {
  await assertCliFailure(['convert', 'fixtures/sample/basic-link/input.html', 'extra.html'], /convert accepts exactly one html file/);
  await assertCliFailure(['inspect', 'fixtures/sample', 'extra'], /inspect accepts exactly one fixture directory/);
});

test('CLI rejects command-specific options on the wrong command', async () => {
  await assertCliFailure(['convert', 'fixtures/sample/basic-link/input.html', '--output', 'out'], /--output is only valid with inspect/);
});
