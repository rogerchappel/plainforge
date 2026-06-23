#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp_dir="$(mktemp -d "/tmp/plainforge-package-smoke.XXXXXX")"
trap 'rm -rf "$tmp_dir"' EXIT

cd "$repo_root"
npm run build >/dev/null
pack_json="$(npm pack --json --pack-destination "$tmp_dir")"
tarball="$(node -e "const data = JSON.parse(process.argv[1]); console.log(data[0].filename)" "$pack_json")"

mkdir -p "$tmp_dir/app"
cd "$tmp_dir/app"
npm init -y >/dev/null
npm install "$tmp_dir/$tarball" >/dev/null

node -e "import('plainforge').then((mod) => { if (typeof mod.convertHtmlToText !== 'function') process.exit(1); })"
./node_modules/.bin/plainforge --help | grep -q "plainforge inspect"
./node_modules/.bin/plainforge convert "$repo_root/fixtures/sample/basic-link/input.html" | grep -q "Plainforge turns HTML"
./node_modules/.bin/plainforge inspect "$repo_root/fixtures/sample" --output "$tmp_dir/report" --json > "$tmp_dir/summary.json"

test -s "$tmp_dir/report/plainforge-report.json"
test -s "$tmp_dir/report/plainforge-report.md"
grep -q '"failed": 0' "$tmp_dir/summary.json"
