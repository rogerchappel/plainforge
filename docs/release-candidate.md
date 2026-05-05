# Release candidate readiness

## Summary
- Branch prepared for release-candidate readiness review.
- Local verification status: **PASS**
- Detailed command output is captured in `.rc_check.log`.

## Checks run
1. `npm run release:check`
2. `bash scripts/validate.sh`
3. `node /Users/roger/Developer/my-opensource/releasebox/bin/releasebox.js check .`

## Result
```
npm notice 69B fixtures/sample/script-noise/expected.txt
npm notice 227B fixtures/sample/script-noise/input.html
npm notice 174B fixtures/sample/script-noise/meta.json
npm notice 67B fixtures/sample/table-list/expected.txt
npm notice 189B fixtures/sample/table-list/input.html
npm notice 146B fixtures/sample/table-list/meta.json
npm notice 1.3kB package.json
npm notice 515B src/diff.js
npm notice 1.1kB src/fixtures.js
npm notice 1.8kB src/html.js
npm notice 1.1kB src/index.js
npm notice 1.6kB src/report.js
npm notice Tarball Details
npm notice name: plainforge
npm notice version: 0.1.0
npm notice filename: plainforge-0.1.0.tgz
npm notice package size: 6.8 kB
npm notice unpacked size: 16.2 kB
npm notice shasum: dbc53eff572884d3b9e30b5184571fa21801afba
npm notice integrity: sha512-oW6ey+1AOhriU[...]fGc8LojphgJCQ==
npm notice total files: 19
npm notice
plainforge-0.1.0.tgz
PASS: package script: release:check
NOTE: agent-qc not installed; skipping optional agent check

Validation passed.

## releasebox
✅ releasebox config: node-cli
✅ ci workflow: .github/workflows/ci.yml
✅ release dry run workflow: .github/workflows/release-dry-run.yml
✅ task breakdown: docs/TASKS.md
✅ orchestration plan: docs/ORCHESTRATION.md
✅ dependabot config: .github/dependabot.yml
✅ npm test script: node --test
✅ build script: node scripts/build.js
✅ smoke script: bash scripts/smoke.sh
✅ bin entry: {"plainforge":"./bin/plainforge.js"}
RESULT release_check=0 validate=0 releasebox=0
```
