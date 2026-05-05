const BLOCK_TAGS = /<\/?(?:article|aside|blockquote|br|div|dl|dt|dd|figcaption|figure|footer|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul)[^>]*>/gi;
const HIDDEN_BLOCKS = /<(script|style|noscript|svg|template|head)[\s\S]*?<\/\1>/gi;

const ENTITIES = new Map([
  ['amp', '&'], ['lt', '<'], ['gt', '>'], ['quot', '"'], ['apos', "'"], ['nbsp', ' '], ['copy', '©'], ['reg', '®'], ['mdash', '—'], ['ndash', '–'], ['hellip', '…']
]);

export function decodeEntities(value) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_, entity) => {
    const key = entity.toLowerCase();
    if (key.startsWith('#x')) return String.fromCodePoint(Number.parseInt(key.slice(2), 16));
    if (key.startsWith('#')) return String.fromCodePoint(Number.parseInt(key.slice(1), 10));
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

  const withLinks = html.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => `${label} (${href})`);
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
