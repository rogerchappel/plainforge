const BLOCK_TAGS = /<\/?(?:article|aside|blockquote|br|div|dl|dt|dd|figcaption|figure|footer|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul)[^>]*>/gi;
const HIDDEN_BLOCKS = /<(script|style|noscript|svg|template|head)[\s\S]*?<\/\1>/gi;

const ENTITIES = new Map([
  ['amp', '&'], ['lt', '<'], ['gt', '>'], ['quot', '"'], ['apos', "'"], ['nbsp', ' '], ['copy', '©'], ['reg', '®'], ['mdash', '—'], ['ndash', '–'], ['hellip', '…']
]);

export function decodeEntities(value) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity) => {
    const key = entity.toLowerCase();
    const numeric = key.startsWith('#x')
      ? Number.parseInt(key.slice(2), 16)
      : key.startsWith('#') ? Number.parseInt(key.slice(1), 10) : null;
    if (numeric !== null) {
      const isUnicodeScalar = numeric >= 0 && numeric <= 0x10FFFF
        && !(numeric >= 0xD800 && numeric <= 0xDFFF);
      return isUnicodeScalar ? String.fromCodePoint(numeric) : '\uFFFD';
    }
    return ENTITIES.get(key) ?? `&${entity};`;
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

  const withLinks = html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a\s*>/gi, (match, attributes, label) => {
    const href = attributes.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i);
    if (!href) return match;
    return `${label} (${href[1] ?? href[2] ?? href[3]})`;
  });
  const text = decodeEntities(
    withLinks
      .replace(HIDDEN_BLOCKS, ' ')
      .replace(/<!--([\s\S]*?)-->/g, ' ')
      .replace(BLOCK_TAGS, '\n')
      .replace(/<[^>]+>/g, ' ')
  );

  return {
    strategy,
    text: normalizeText(text, { compact: strategy === 'compact' })
  };
}
