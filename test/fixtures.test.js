import test from 'node:test';
import assert from 'node:assert/strict';
import { discoverFixtures, inspectFixtures } from '../src/index.js';

test('discoverFixtures loads fixture metadata in stable order', async () => {
  const fixtures = await discoverFixtures('fixtures/sample');
  assert.deepEqual(fixtures.map((fixture) => fixture.id), ['basic-link', 'script-noise', 'table-list']);
  assert.equal(fixtures[0].tags.includes('links'), true);
});

test('inspectFixtures passes bundled sample fixtures', async () => {
  const report = await inspectFixtures('fixtures/sample');
  assert.equal(report.summary.total, 3);
  assert.equal(report.summary.failed, 0);
});
