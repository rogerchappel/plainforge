import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { discoverFixtures, inspectFixtures, loadFixture } from '../src/index.js';

test('discoverFixtures loads fixture metadata in stable order', async () => {
  const fixtures = await discoverFixtures('fixtures/sample');
  assert.deepEqual(fixtures.map((fixture) => fixture.id), ['basic-link', 'html-recovery', 'script-noise', 'table-list']);
  assert.equal(fixtures[0].tags.includes('links'), true);
});

test('inspectFixtures passes bundled sample fixtures', async () => {
  const report = await inspectFixtures('fixtures/sample');
  assert.equal(report.summary.total, 4);
  assert.equal(report.summary.failed, 0);
});

test('loadFixture preserves metadata defaults when meta.json or fields are omitted', async () => {
  const root = await mkdtemp(join(tmpdir(), 'plainforge-fixture-'));
  const fixtureDir = join(root, 'default-case');
  try {
    await mkdir(fixtureDir);
    await writeFile(join(fixtureDir, 'input.html'), '<p>Expected</p>');
    await writeFile(join(fixtureDir, 'expected.txt'), 'Expected');
    assert.deepEqual(
      (({ id, title, tags, notes }) => ({ id, title, tags, notes }))(await loadFixture(fixtureDir)),
      { id: 'default-case', title: 'default-case', tags: [], notes: '' }
    );
    await writeFile(join(fixtureDir, 'meta.json'), '{}');
    assert.equal((await loadFixture(fixtureDir)).id, 'default-case');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('loadFixture rejects malformed metadata with the metadata path', async () => {
  const root = await mkdtemp(join(tmpdir(), 'plainforge-fixture-'));
  const fixtureDir = join(root, 'invalid-case');
  try {
    await mkdir(fixtureDir);
    await writeFile(join(fixtureDir, 'input.html'), '<p>Expected</p>');
    await writeFile(join(fixtureDir, 'expected.txt'), 'Expected');
    const invalidMetadata = [
      ['null', 'fixture metadata must be a JSON object'],
      ['[]', 'fixture metadata must be a JSON object'],
      ['{"id":1}', 'id must be a string'],
      ['{"title":false}', 'title must be a string'],
      ['{"notes":{}}', 'notes must be a string'],
      ['{"tags":"docs"}', 'tags must be an array of strings'],
      ['{"tags":["docs",1]}', 'tags must be an array of strings']
    ];
    for (const [json, message] of invalidMetadata) {
      await writeFile(join(fixtureDir, 'meta.json'), json);
      await assert.rejects(loadFixture(fixtureDir), (error) => {
        assert.match(error.message, /invalid-case\/meta\.json/);
        assert.match(error.message, new RegExp(message));
        return true;
      });
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('discoverFixtures identifies which malformed meta.json failed to parse', async () => {
  const root = await mkdtemp(join(tmpdir(), 'plainforge-fixtures-'));
  try {
    for (const name of ['valid-case', 'broken-case']) {
      const fixtureDir = join(root, name);
      await mkdir(fixtureDir);
      await writeFile(join(fixtureDir, 'input.html'), '<p>Expected</p>');
      await writeFile(join(fixtureDir, 'expected.txt'), 'Expected');
      await writeFile(join(fixtureDir, 'meta.json'), name === 'valid-case' ? '{}' : '{"title": }');
    }
    await assert.rejects(discoverFixtures(root), (error) => {
      assert.match(error.message, /broken-case\/meta\.json/);
      assert.match(error.message, /invalid JSON/);
      assert.match(error.message, /position|line|column/i);
      return true;
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
