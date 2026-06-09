# plainforge

Plainforge is a local-first fixture workbench for HTML-to-plain-text extraction.
It helps developers and agents compare conversion behavior against small, reviewable fixtures before trusting extracted text in docs, crawlers, or automation.

## Why

HTML-to-text conversion often looks simple until links, tables, hidden script blocks, entities, and spacing collide. Plainforge gives those edge cases a tiny home:

- keep representative HTML snippets in `fixtures/`
- record expected plain text beside each snippet
- run deterministic conversions locally
- export JSON and Markdown reports for review

Plainforge was inspired by the existence of adjacent `html2text` projects, including `vincentkoc/html2text`, but it is a fresh JavaScript implementation focused on fixture-driven testing rather than copying another project's implementation.

## Install

```sh
npm install
```

For local development you can run the CLI directly:

```sh
node bin/plainforge.js --help
```

After publishing, the package exposes a `plainforge` binary.

## Quickstart

Inspect the bundled sample fixtures and write reports:

```sh
node bin/plainforge.js inspect fixtures/sample --output out/plainforge
```

Convert one local HTML file:

```sh
node bin/plainforge.js convert fixtures/sample/basic-link/input.html
```

Use JSON output in automation:

```sh
node bin/plainforge.js inspect fixtures/sample --json
```

## Fixture format

Each fixture is a directory with:

```text
my-case/
  input.html      # source HTML
  expected.txt    # expected plain-text output
  meta.json       # optional id/title/tags/notes
```

See [`fixtures/sample`](fixtures/sample) for working examples.

## API

```js
import { convertHtmlToText, inspectFixtures } from 'plainforge';

const conversion = convertHtmlToText('<h1>Hello</h1><p>World</p>');
console.log(conversion.text);

const report = await inspectFixtures('fixtures/sample');
console.log(report.summary);
```

## Safety boundaries

Plainforge is intentionally boring and local:

- reads local files you point it at
- writes reports only when `--output` is provided
- makes no network calls
- sends no telemetry
- does not read credentials
- does not publish packages, releases, or reports

Treat fixture content as untrusted text. Plainforge does not execute HTML, JavaScript, CSS, or remote resources.

## Development

```sh
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

A real CLI smoke is also available:

```sh
node bin/plainforge.js inspect fixtures/sample --output out/smoke --json
```

## Project status

This is a usable MVP: fixture discovery, deterministic conversion, comparison diffs, JSON/Markdown reports, tests, and CLI smokes are implemented. The roadmap is intentionally conservative until real users identify the next painful extraction cases.

## License

MIT

## Release Readiness

Use the checked-in scripts before opening or publishing a release:

```sh
npm run check
npm test
npm run build
npm run smoke
npm run package:smoke
npm run release:check
```

The package smoke uses `npm pack --dry-run` so the published file list can be reviewed without publishing.
