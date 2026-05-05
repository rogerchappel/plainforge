import test from 'node:test';
import assert from 'node:assert/strict';
import { convertHtmlToText, decodeEntities, normalizeText } from '../src/index.js';

test('decodeEntities handles named and numeric entities', () => {
  assert.equal(decodeEntities('Tom &amp; Jerry &#169; &#x1F680;'), 'Tom & Jerry © 🚀');
});

test('normalizeText trims blank lines and repeated spaces', () => {
  assert.equal(normalizeText(' Alpha   beta \n\n Gamma\t delta '), 'Alpha beta\nGamma delta');
});

test('convertHtmlToText preserves link hrefs', () => {
  const result = convertHtmlToText('<p>Read <a href="https://example.test">docs</a></p>');
  assert.equal(result.text, 'Read docs (https://example.test)');
});

test('convertHtmlToText excludes script and style blocks', () => {
  const result = convertHtmlToText('<style>x</style><script>secret()</script><h1>Visible</h1>');
  assert.equal(result.text, 'Visible');
});

test('compact strategy returns one line', () => {
  const result = convertHtmlToText('<h1>A</h1><p>B</p>', { strategy: 'compact' });
  assert.equal(result.text, 'A B');
});
