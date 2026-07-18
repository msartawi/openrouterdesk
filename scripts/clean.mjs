import { rm } from 'node:fs/promises';

await Promise.all([
  rm('dist-electron', { recursive: true, force: true }),
  rm('dist-renderer', { recursive: true, force: true }),
]);
