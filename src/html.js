const BLOCK_TAGS = /<\/?(?:article|aside|blockquote|br|div|dl|dt|dd|figcaption|figure|footer|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul)(?=[\s/>])(?:"[^"]*"|'[^']*'|[^'">])*>/gi;
const HIDDEN_BLOCKS = /<(script|style|noscript|svg|template|head)\b(?:"[^"]*"|'[^']*'|[^'">])*>[\s\S]*?(?:<\/\1\s*>|$)/gi;
const HTML_TAG = /<\/?[a-z][a-z0-9:-]*(?:\s+(?:"[^"]*"|'[^']*'|[^'">])*)?\s*\/?>|<!doctype(?:\s+(?:"[^"]*"|'[^']*'|[^'">])*)?>/gi;

const ENTITIES = new Map([
  ['amp', '&'], ['lt', '<'], ['gt', '>'], ['quot', '"'], ['apos', "'"], ['nbsp', ' '], ['copy', '©'], ['reg', '®'],
  ['trade', '™'], ['euro', '€'], ['pound', '£'], ['cent', '¢'], ['yen', '¥'], ['notin', '∉'], ['le', '≤'], ['ge', '≥'],
  ['iexcl', '¡'], ['curren', '¤'], ['brvbar', '¦'], ['sect', '§'], ['uml', '¨'], ['ordf', 'ª'], ['laquo', '«'],
  ['not', '¬'], ['shy', '­'], ['macr', '¯'], ['deg', '°'], ['plusmn', '±'], ['sup2', '²'], ['sup3', '³'],
  ['acute', '´'], ['micro', 'µ'], ['para', '¶'], ['middot', '·'], ['cedil', '¸'], ['sup1', '¹'], ['ordm', 'º'],
  ['raquo', '»'], ['frac14', '¼'], ['frac12', '½'], ['frac34', '¾'], ['iquest', '¿'], ['times', '×'], ['divide', '÷'],
  ['lsquo', '‘'], ['rsquo', '’'], ['ldquo', '“'], ['rdquo', '”'], ['bull', '•'],
  ['mdash', '—'], ['ndash', '–'], ['hellip', '…'], ['permil', '‰'], ['lsaquo', '‹'], ['rsaquo', '›']
  , ['Agrave', 'À'], ['Aacute', 'Á'], ['Acirc', 'Â'], ['Atilde', 'Ã'], ['Auml', 'Ä'], ['Aring', 'Å'], ['AElig', 'Æ'], ['Ccedil', 'Ç'],
  ['Egrave', 'È'], ['Eacute', 'É'], ['Ecirc', 'Ê'], ['Euml', 'Ë'], ['Igrave', 'Ì'], ['Iacute', 'Í'], ['Icirc', 'Î'], ['Iuml', 'Ï'],
  ['ETH', 'Ð'], ['Ntilde', 'Ñ'], ['Ograve', 'Ò'], ['Oacute', 'Ó'], ['Ocirc', 'Ô'], ['Otilde', 'Õ'], ['Ouml', 'Ö'], ['Oslash', 'Ø'],
  ['Ugrave', 'Ù'], ['Uacute', 'Ú'], ['Ucirc', 'Û'], ['Uuml', 'Ü'], ['Yacute', 'Ý'], ['THORN', 'Þ'], ['szlig', 'ß'],
  ['agrave', 'à'], ['aacute', 'á'], ['acirc', 'â'], ['atilde', 'ã'], ['auml', 'ä'], ['aring', 'å'], ['aelig', 'æ'], ['ccedil', 'ç'],
  ['egrave', 'è'], ['eacute', 'é'], ['ecirc', 'ê'], ['euml', 'ë'], ['igrave', 'ì'], ['iacute', 'í'], ['icirc', 'î'], ['iuml', 'ï'],
  ['eth', 'ð'], ['ntilde', 'ñ'], ['ograve', 'ò'], ['oacute', 'ó'], ['ocirc', 'ô'], ['otilde', 'õ'], ['ouml', 'ö'], ['oslash', 'ø'],
  ['ugrave', 'ù'], ['uacute', 'ú'], ['ucirc', 'û'], ['uuml', 'ü'], ['yacute', 'ý'], ['thorn', 'þ'], ['yuml', 'ÿ']
]);

const NUMERIC_REFERENCE_REPLACEMENTS = new Map([
  [0x80, 0x20ac], [0x82, 0x201a], [0x83, 0x0192], [0x84, 0x201e], [0x85, 0x2026],
  [0x86, 0x2020], [0x87, 0x2021], [0x88, 0x02c6], [0x89, 0x2030], [0x8a, 0x0160],
  [0x8b, 0x2039], [0x8c, 0x0152], [0x8e, 0x017d], [0x91, 0x2018], [0x92, 0x2019],
  [0x93, 0x201c], [0x94, 0x201d], [0x95, 0x2022], [0x96, 0x2013], [0x97, 0x2014],
  [0x98, 0x02dc], [0x99, 0x2122], [0x9a, 0x0161], [0x9b, 0x203a], [0x9c, 0x0153],
  [0x9e, 0x017e], [0x9f, 0x0178]
]);

function decodeNumericReference(entity) {
  const hexadecimal = entity[1].toLowerCase() === 'x';
  const numeric = Number.parseInt(entity.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
  if (numeric === 0 || numeric > 0x10ffff || (numeric >= 0xd800 && numeric <= 0xdfff)) return '\ufffd';
  return String.fromCodePoint(NUMERIC_REFERENCE_REPLACEMENTS.get(numeric) ?? numeric);
}

export function decodeEntities(value) {
  return value.replace(/&(#(?:x[0-9a-f]+|[0-9]+));?|&([a-z][a-z0-9]+);/gi, (match, numeric, named) => {
    if (numeric) return decodeNumericReference(numeric);
    return ENTITIES.get(named) ?? ENTITIES.get(named.toLowerCase()) ?? match;
  });
}

export function normalizeText(value, { compact = false } = {}) {
  const lines = value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[\t ]+/g, ' ').trim())
    .filter(Boolean);
  return compact ? lines.join(' ') : lines.join('\n');
}

export function convertHtmlToText(html, options = {}) {
  const strategy = options.strategy ?? 'readable';
  if (!['readable', 'compact'].includes(strategy)) throw new Error(`unsupported strategy: ${strategy}`);

  const withLinks = html.replace(/<a\b((?:"[^"]*"|'[^']*'|[^'">])*)>([\s\S]*?)<\/a\s*>/gi, (match, attributes, label) => {
    const href = attributes.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i);
    if (!href) return match;
    return `${label} (${href[1] ?? href[2] ?? href[3]})`;
  });
  const text = decodeEntities(
    withLinks
      .replace(HIDDEN_BLOCKS, ' ')
      .replace(/<!--[\s\S]*?(?:-->|$)/g, ' ')
      .replace(BLOCK_TAGS, '\n')
      .replace(HTML_TAG, ' ')
  );

  return {
    strategy,
    text: normalizeText(text, { compact: strategy === 'compact' })
  };
}
