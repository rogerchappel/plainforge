import { appendFile, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const [manifestPath = 'package.json', packResultPath] = process.argv.slice(2);
const tag = process.env.GITHUB_REF_NAME;

if (!tag || !/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(tag)) {
  throw new Error(`GITHUB_REF_NAME must be a semantic version tag prefixed with v; received ${tag ?? 'nothing'}`);
}
if (!packResultPath) {
  throw new Error('Usage: node scripts/validate-release-artifact.mjs <package.json> <npm-pack.json>');
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (tag !== `v${manifest.version}`) {
  throw new Error(`Release tag ${tag} does not match ${manifest.name}@${manifest.version}`);
}

const packResults = JSON.parse(await readFile(packResultPath, 'utf8'));
if (!Array.isArray(packResults) || packResults.length !== 1) {
  throw new Error(`Expected exactly one packed artifact, received ${packResults.length ?? 'invalid output'}`);
}

const packed = packResults[0];
if (packed.name !== manifest.name || packed.version !== manifest.version) {
  throw new Error(`Packed identity ${packed.name}@${packed.version} does not match ${manifest.name}@${manifest.version}`);
}

const artifactDirectory = path.resolve(path.dirname(packResultPath));
const tarball = path.resolve(artifactDirectory, packed.filename);
if (path.dirname(tarball) !== artifactDirectory || !packed.filename.endsWith('.tgz')) {
  throw new Error(`Unsafe npm pack filename: ${packed.filename}`);
}
if ((await stat(tarball)).size === 0) {
  throw new Error(`Packed artifact is empty: ${tarball}`);
}

console.log(`Validated ${manifest.name}@${manifest.version} from ${tag}: ${tarball}`);
if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `tarball=${tarball}\npackage=${manifest.name}\nversion=${manifest.version}\n`);
}
