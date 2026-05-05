import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await writeFile(join(dist.pathname, 'README.txt'), 'plainforge is source-distributed; build verifies the package layout.\n');
console.log('built dist/');
