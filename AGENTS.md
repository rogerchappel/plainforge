# Agent Operating Instructions for plainforge

Project: `plainforge`
Repository: `https://github.com/rogerchappel/plainforge`
Default branch: `main`
Package manager: `npm`
Primary verification command: `bash scripts/validate.sh`

## Core principle

Move quickly, but keep every change reviewable, reversible, verifiable, and safe.

## Product contract

`docs/PRD.md` is the product contract. Plainforge is a local-first fixture-driven HTML-to-plain-text testbed. Do not add hidden network calls, telemetry, credential access, or publish behavior.

## Atomic commits

Use Conventional Commits. One commit should represent one reviewable intent. Keep unrelated docs, code, tests, generated files, dependency changes, and CI changes separate.

## Verification

Use the smallest relevant check first, then run the full gate before review:

```sh
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

## Review pack

For meaningful changes, include:

```md
## Review Pack
Repo: https://github.com/rogerchappel/plainforge
Branch:
PR:
Task:
Status:
Summary:
Commits:
Files changed:
Verification:
Risk level:
Rollback plan:
Human decision needed:
Next recommended task:
```
