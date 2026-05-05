import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export function createReport(results, strategy) {
  const passed = results.filter((result) => result.passed).length;
  return {
    summary: {
      strategy,
      total: results.length,
      passed,
      failed: results.length - passed,
      generatedAt: new Date().toISOString()
    },
    results
  };
}

export function renderMarkdownReport(report) {
  const lines = [
    '# Plainforge fixture report',
    '',
    `Strategy: \`${report.summary.strategy}\``,
    `Fixtures: ${report.summary.passed}/${report.summary.total} passed`,
    `Generated: ${report.summary.generatedAt}`,
    '',
    '| Fixture | Status | Tags | Notes |',
    '|---|---:|---|---|'
  ];
  for (const result of report.results) {
    lines.push(`| ${result.id} | ${result.passed ? 'pass' : 'fail'} | ${result.tags.join(', ')} | ${result.notes.replace(/\|/g, '\\|')} |`);
  }
  for (const result of report.results.filter((item) => !item.passed)) {
    lines.push('', `## Diff: ${result.id}`, '', '```diff');
    for (const entry of result.diff) {
      lines.push(`- ${entry.expected}`, `+ ${entry.actual}`);
    }
    lines.push('```');
  }
  return `${lines.join('\n')}\n`;
}

export async function writeReport(report, outputDir) {
  await mkdir(outputDir, { recursive: true });
  const json = join(outputDir, 'plainforge-report.json');
  const markdown = join(outputDir, 'plainforge-report.md');
  await Promise.all([
    writeFile(json, `${JSON.stringify(report, null, 2)}\n`),
    writeFile(markdown, renderMarkdownReport(report))
  ]);
  return { json, markdown };
}
