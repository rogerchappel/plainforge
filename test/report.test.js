import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { compareText, createReport, renderMarkdownReport, writeReport } from '../src/index.js';

test('compareText records line diffs', () => {
  assert.deepEqual(compareText('a\nc', 'a\nb'), { passed: false, diff: [{ line: 2, expected: 'b', actual: 'c' }] });
});

test('renderMarkdownReport summarizes results', () => {
  const report = createReport([{ id: 'case', tags: ['x'], notes: 'note', passed: true, diff: [] }], 'readable');
  const markdown = renderMarkdownReport(report);
  assert.match(markdown, /Fixtures: 1\/1 passed/);
  assert.match(markdown, /\| case \| pass \| x \| note \|/);
});

test('writeReport writes json and markdown reports', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'plainforge-'));
  try {
    const report = createReport([], 'readable');
    const written = await writeReport(report, dir);
    assert.match(await readFile(written.json, 'utf8'), /"total": 0/);
    assert.match(await readFile(written.markdown, 'utf8'), /Plainforge fixture report/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
