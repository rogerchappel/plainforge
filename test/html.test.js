import test from 'node:test';
import assert from 'node:assert/strict';
import { convertHtmlToText, decodeEntities, normalizeText } from '../src/index.js';

test('decodeEntities handles named and numeric entities', () => {
  assert.equal(decodeEntities('Tom &amp; Jerry &#169; &#x1F680;'), 'Tom & Jerry © 🚀');
});

test('decodeEntities replaces numeric references outside Unicode', () => {
  assert.equal(decodeEntities('hex: &#x110000; decimal: &#999999999999;'), 'hex: � decimal: �');
});

test('normalizeText trims blank lines and repeated spaces', () => {
  assert.equal(normalizeText(' Alpha   beta \n\n Gamma\t delta '), 'Alpha beta\nGamma delta');
});

test('convertHtmlToText preserves link hrefs', () => {
  const result = convertHtmlToText('<p>Read <a href="https://example.test">docs</a></p>');
  assert.equal(result.text, 'Read docs (https://example.test)');
});

test('convertHtmlToText preserves unquoted link hrefs', () => {
  const result = convertHtmlToText('<p>Read <a class=external href=https://example.test/docs/plainforge>docs</a></p>');
  assert.equal(result.text, 'Read docs (https://example.test/docs/plainforge)');
});

test('convertHtmlToText excludes closed hidden blocks without disturbing visible text', () => {
  for (const tag of ['script', 'style', 'noscript', 'svg', 'template', 'head']) {
    const result = convertHtmlToText(`<p>Before</p><${tag} data-test="hidden">secret</${tag}><p>After</p>`);
    assert.equal(result.text, 'Before\nAfter', tag);
  }
});

test('convertHtmlToText excludes unclosed hidden blocks through the end of truncated input', () => {
  for (const tag of ['script', 'style', 'noscript', 'svg', 'template', 'head']) {
    const result = convertHtmlToText(`<p>Visible</p><${tag} data-test="hidden">secret`);
    assert.equal(result.text, 'Visible', tag);
  }
});

test('compact strategy returns one line', () => {
  const result = convertHtmlToText('<h1>A</h1><p>B</p>', { strategy: 'compact' });
  assert.equal(result.text, 'A B');
});
