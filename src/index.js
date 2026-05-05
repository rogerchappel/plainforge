export { convertHtmlToText, decodeEntities, normalizeText } from './html.js';
export { discoverFixtures, loadFixture } from './fixtures.js';
export { compareText } from './diff.js';
export { createReport, renderMarkdownReport, writeReport } from './report.js';

import { convertHtmlToText } from './html.js';
import { discoverFixtures } from './fixtures.js';
import { compareText } from './diff.js';
import { createReport } from './report.js';

export async function inspectFixtures(rootDir, options = {}) {
  const strategy = options.strategy ?? 'readable';
  const fixtures = await discoverFixtures(rootDir);
  const results = fixtures.map((fixture) => {
    const conversion = convertHtmlToText(fixture.html, { strategy });
    const comparison = compareText(conversion.text, fixture.expected);
    return {
      id: fixture.id,
      title: fixture.title,
      tags: fixture.tags,
      notes: fixture.notes,
      passed: comparison.passed,
      expected: fixture.expected,
      actual: conversion.text,
      diff: comparison.diff
    };
  });
  return createReport(results, strategy);
}
