import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { convertHtmlToText, decodeEntities, normalizeText } from '../src/index.js';

const entityCases = JSON.parse(readFileSync(new URL('./fixtures/html-entity-recovery.json', import.meta.url), 'utf8'));

test('decodeEntities handles named and numeric entities', () => {
  assert.equal(decodeEntities('Tom &amp; Jerry &#169; &#x1F680;'), 'Tom & Jerry © 🚀');
});

test('decodeEntities handles semicolonless legacy named references in text', () => {
  const cases = [
    ['Fish &amp chips', 'Fish & chips'],
    ['Copyright &copy 2026', 'Copyright © 2026'],
    ['Marks &lt &gt &quot &nbsp &reg', 'Marks < > "   ®']
  ];
  for (const [input, expected] of cases) assert.equal(decodeEntities(input), expected);
});

test('decodeEntities preserves ambiguous and unknown semicolonless references', () => {
  const cases = [
    ['Rock &ampersand', 'Rock &ampersand'],
    ['Copyright &copycat', 'Copyright &copycat'],
    ['Unknown &madeup name', 'Unknown &madeup name'],
    ['Modern &mdash text', 'Modern &mdash text']
  ];
  for (const [input, expected] of cases) assert.equal(decodeEntities(input), expected);
});

test('decodeEntities handles common currency and math references', () => {
  assert.equal(decodeEntities('&pound; &cent; &yen; &notin; &le; &ge;'), '£ ¢ ¥ ∉ ≤ ≥');
});

test('decodeEntities handles common Greek, mathematical, and arrow references', () => {
  const cases = [
    ['Greek letters', '&Alpha; &Omega; &alpha; &beta; &omega;', 'Α Ω α β ω'],
    ['mathematical operators', '&forall; &part; &prod; &sum; &radic; &int;', '∀ ∂ ∏ ∑ √ ∫'],
    ['mathematical relations', '&isin; &notin; &ne; &equiv; &sube; &perp;', '∈ ∉ ≠ ≡ ⊆ ⊥'],
    ['directional arrows', '&larr; &uarr; &rarr; &darr; &harr; &rArr;', '← ↑ → ↓ ↔ ⇒']
  ];

  for (const [name, input, expected] of cases) assert.equal(decodeEntities(input), expected, name);
});

test('convertHtmlToText exposes common named-reference symbols', () => {
  assert.equal(
    convertHtmlToText('<p>&alpha; + &beta; &ne; &sum; &rarr; &Omega;</p>').text,
    'α + β ≠ ∑ → Ω'
  );
});

test('decodeEntities preserves undefined reference spellings case-sensitively', () => {
  assert.equal(decodeEntities('&Aacute; &aacute; &AACUTE; &POUND; &NotIn; &madeup;'), 'Á á &AACUTE; &POUND; &NotIn; &madeup;');
});

test('decodeEntities handles semicolon-terminated Latin named references', () => {
  assert.equal(decodeEntities('Fran&ccedil;ais &eacute;lan'), 'Français élan');
  assert.equal(decodeEntities('&Ccedil; &Eacute; &uuml;'), 'Ç É ü');
  assert.equal(decodeEntities('&eacute and &unknown;'), '&eacute and &unknown;');
});

test('decodeEntities handles the remaining HTML Latin-1 named references', () => {
  assert.equal(
    decodeEntities('&iexcl; &curren; &brvbar; &sect; &uml; &ordf; &laquo; &not; &shy; &macr; &deg; &plusmn; &sup2; &sup3; &acute; &micro; &para; &middot; &cedil; &sup1; &ordm; &raquo; &frac14; &frac12; &frac34; &iquest; &times; &divide;'),
    '¡ ¤ ¦ § ¨ ª « ¬ \u00ad ¯ ° ± ² ³ ´ µ ¶ · ¸ ¹ º » ¼ ½ ¾ ¿ × ÷'
  );
});

test('convertHtmlToText exposes Latin-1 fractions and operators', () => {
  assert.equal(
    convertHtmlToText('<p>One half: &frac12; multiply: &times; divide: &divide;</p>').text,
    'One half: ½ multiply: × divide: ÷'
  );
});

test('decodeEntities handles common semicolon-terminated symbolic references', () => {
  assert.equal(decodeEntities('&trade; &euro; &ldquo;quoted&rdquo;'), '™ € “quoted”');
  assert.equal(decodeEntities('&trade &euro &ldquo &not-a-reference;'), '&trade &euro &ldquo &not-a-reference;');
});

test('decodeEntities replaces numeric references outside Unicode', () => {
  assert.equal(decodeEntities('hex: &#x110000; decimal: &#999999999999;'), 'hex: � decimal: �');
});

test('decodeEntities follows HTML numeric reference recovery', () => {
  for (const { name, input, expected } of entityCases) assert.equal(decodeEntities(input), expected, name);
});

test('convertHtmlToText exposes recovered characters instead of numeric controls', () => {
  assert.equal(convertHtmlToText('<p>NUL: &#0; C1: &#x80;</p>').text, 'NUL: � C1: €');
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

test('convertHtmlToText keeps quoted greater-than signs inside anchor attributes', () => {
  for (const quote of ['"', "'"]) {
    const html = `<span>Before</span><a title=${quote}1 > 0${quote} href=${quote}/x${quote}>Link</a><em>After</em>`;
    assert.equal(convertHtmlToText(html).text, 'Before Link (/x) After', `readable ${quote}`);
    assert.equal(convertHtmlToText(html, { strategy: 'compact' }).text, 'Before Link (/x) After', `compact ${quote}`);
  }
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

test('convertHtmlToText excludes an unclosed comment through end of input', () => {
  assert.equal(convertHtmlToText('<p>Visible</p><!-- hidden to EOF').text, 'Visible');
  assert.equal(convertHtmlToText('before <!-- hidden --> after').text, 'before after');
});

test('convertHtmlToText preserves ordinary less-than and greater-than comparisons', () => {
  assert.equal(convertHtmlToText('2 < 3 and 4 > 1').text, '2 < 3 and 4 > 1');
  assert.equal(convertHtmlToText('<p>2 < 3</p><em>still text</em>').text, '2 < 3\nstill text');
});

test('convertHtmlToText omits hidden blocks with greater-than signs in quoted attributes', () => {
  const html = '<p>Before &amp;</p><script data-expression="1 > 0">secret</script><p>After</p>';
  assert.equal(convertHtmlToText(html).text, 'Before &\nAfter');
});

test('convertHtmlToText does not treat custom tags with block-tag prefixes as blocks', () => {
  const result = convertHtmlToText('before<bracket>inside</bracket><p-card>after</p-card>end');
  assert.equal(result.text, 'before inside after end');
});

test('convertHtmlToText removes ordinary tags with quoted greater-than signs', () => {
  const html = '<span title="1 > 0">Hello</span><em title=\'2 > 1\'> world</em>';
  assert.equal(convertHtmlToText(html).text, 'Hello world');
});

test('convertHtmlToText separates complete block tag names', () => {
  const result = convertHtmlToText('before<br>break<p class="lead">paragraph</p><hr/>after');
  assert.equal(result.text, 'before\nbreak\nparagraph\nafter');
});

test('convertHtmlToText keeps quoted greater-than signs inside block attributes', () => {
  for (const quote of ['"', "'"]) {
    const html = `<span>Before</span><p title=${quote}1 > 0${quote}>Hello</p><em>After</em>`;
    assert.equal(convertHtmlToText(html).text, 'Before\nHello\nAfter', `readable ${quote}`);
    assert.equal(convertHtmlToText(html, { strategy: 'compact' }).text, 'Before Hello After', `compact ${quote}`);
  }
});

test('compact strategy returns one line', () => {
  const result = convertHtmlToText('<h1>A</h1><p>B</p>', { strategy: 'compact' });
  assert.equal(result.text, 'A B');
});
