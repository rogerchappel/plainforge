#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { convertHtmlToText, inspectFixtures, writeReport } from '../src/index.js';

const HELP = `plainforge

Local-first HTML-to-plain-text fixture runner.

Usage:
  plainforge --help
  plainforge convert <html-file> [--strategy readable|compact] [--json]
  plainforge inspect <fixture-dir> [--output <dir>] [--strategy readable|compact] [--json]

Examples:
  plainforge convert fixtures/sample/basic-link/input.html
  plainforge inspect fixtures/sample --output out/plainforge

Safety:
  plainforge reads local files only. It does not make network calls, collect
  credentials, publish results, or send telemetry.
`;

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = { _: [] };
  for (let i = 0; i < rest.length; i += 1) {
    const item = rest[i];
    if (item === '--output' || item === '-o') options.output = rest[++i];
    else if (item === '--strategy') options.strategy = rest[++i];
    else if (item === '--json') options.json = true;
    else if (item === '--help' || item === '-h') options.help = true;
    else options._.push(item);
  }
  return { command, options };
}

function fail(message, code = 1) {
  console.error(`plainforge: ${message}`);
  process.exit(code);
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));
  if (!command || command === '--help' || command === '-h' || options.help) {
    console.log(HELP);
    return;
  }

  if (command === 'convert') {
    const file = options._[0];
    if (!file) fail('convert requires an html file');
    const html = readFileSync(resolve(file), 'utf8');
    const result = convertHtmlToText(html, { strategy: options.strategy });
    if (options.json) console.log(JSON.stringify(result, null, 2));
    else console.log(result.text);
    return;
  }

  if (command === 'inspect') {
    const fixtureDir = options._[0];
    if (!fixtureDir) fail('inspect requires a fixture directory');
    const report = await inspectFixtures(resolve(fixtureDir), { strategy: options.strategy });
    if (options.output) {
      const written = await writeReport(report, resolve(options.output));
      if (options.json) console.log(JSON.stringify({ ...report.summary, written }, null, 2));
      else console.log(`plainforge inspected ${report.summary.total} fixtures: ${report.summary.passed} passed, ${report.summary.failed} failed.\nReport: ${written.markdown}`);
      process.exitCode = report.summary.failed > 0 ? 1 : 0;
      return;
    }
    if (options.json) console.log(JSON.stringify(report, null, 2));
    else console.log(`${report.summary.passed}/${report.summary.total} fixtures passed (${report.summary.strategy})`);
    process.exitCode = report.summary.failed > 0 ? 1 : 0;
    return;
  }

  fail(`unknown command: ${command}`);
}

main().catch((error) => fail(error.message));
