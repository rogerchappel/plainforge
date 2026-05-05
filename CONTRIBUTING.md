# Contributing

Thanks for helping improve Plainforge.

Plainforge values small, reviewable changes with fixture-backed verification. If you are adding extraction behavior, add or update a fixture first so reviewers can see the exact edge case.

## Setup

```sh
npm install
npm test
npm run smoke
```

## Pull requests

PRs should:

- focus on one reviewable intent
- use Conventional Commits where possible
- include tests or fixtures for behavior changes
- update README/examples/docs when usage changes
- avoid unrelated formatting or dependency churn
- avoid secrets, private data, and hidden network behavior

## Adding fixtures

A fixture directory contains:

- `input.html`
- `expected.txt`
- optional `meta.json`

Run:

```sh
node bin/plainforge.js inspect fixtures/sample --output out/plainforge
```

## Verification

Before review, run:

```sh
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

If a check cannot run, include the reason and the exact command maintainers should run.

## Safety expectations

Plainforge must stay local-first. New behavior that reads outside explicit inputs, makes network calls, executes fixture content, sends telemetry, or publishes results needs a clear issue discussion and an opt-in design before implementation.
