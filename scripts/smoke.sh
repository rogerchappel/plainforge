#!/usr/bin/env bash
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"
rm -rf out/smoke
mkdir -p out
node bin/plainforge.js --help >/tmp/plainforge-help.txt
grep -q "plainforge inspect" /tmp/plainforge-help.txt
node bin/plainforge.js convert fixtures/sample/basic-link/input.html | grep -q "Plainforge turns HTML"
node bin/plainforge.js inspect fixtures/sample --output out/smoke --json > out/smoke-summary.json
test -s out/smoke/plainforge-report.json
test -s out/smoke/plainforge-report.md
grep -q '"failed": 0' out/smoke-summary.json
printf 'plainforge smoke passed\n'
