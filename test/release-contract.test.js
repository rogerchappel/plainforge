import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflow = await readFile(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8');
const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
const releasebox = JSON.parse(await readFile(new URL('../releasebox.config.json', import.meta.url), 'utf8'));

function position(fragment) {
  const index = workflow.indexOf(fragment);
  assert.notEqual(index, -1, `release workflow must include: ${fragment}`);
  return index;
}

test('release configuration enables npm publication', () => {
  assert.equal(releasebox.release.publishNpm, true);
  assert.match(workflow, /^\s*id-token: write$/m);
  assert.doesNotMatch(workflow, /NODE_AUTH_TOKEN|NPM_TOKEN/);
});

test('release checks and one artifact validation precede publication', () => {
  const checks = position('npm run release:check');
  const pack = position('npm pack --json --pack-destination release-artifacts');
  const validation = position('scripts/validate-release-artifact.mjs');
  const publish = position('npm publish "${{ steps.artifact.outputs.tarball }}" --provenance --access public');
  const githubRelease = position('gh release create "${GITHUB_REF_NAME}" --notes-file RELEASE_NOTES.md "${{ steps.artifact.outputs.tarball }}"');

  assert.ok(checks < pack, 'release checks must run before packing');
  assert.ok(pack < validation, 'the pack result must exist before artifact validation');
  assert.ok(validation < publish, 'artifact validation must run before npm publication');
  assert.ok(publish < githubRelease, 'npm publication must succeed before creating the GitHub release');
  assert.doesNotMatch(workflow, /\*\.tgz/, 'release workflow must not use an unchecked tarball wildcard');
});

test('installation guidance names the supported v0.1.0 distribution', () => {
  assert.match(
    readme,
    /npm install https:\/\/github\.com\/rogerchappel\/plainforge\/releases\/download\/v0\.1\.0\/plainforge-0\.1\.0\.tgz/,
  );
  assert.match(readme, /not currently available from the npm registry/i);
  assert.doesNotMatch(
    readme,
    /If validation or npm publication fails, no GitHub release is created/,
    'release recovery guidance must not treat a GitHub release as proof of npm publication',
  );
});
