import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const directory = fileURLToPath(new URL('../demos/florasis/', import.meta.url));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
function run(args) {
  const result = spawnSync(npm, args, {cwd: directory, stdio:'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const lock = path.join(directory, 'package-lock.json');
if (!existsSync(lock)) throw new Error('Florasis package-lock.json is required for a reproducible build.');
const hash = createHash('sha256').update(readFileSync(lock)).digest('hex');
const stamp = path.join(directory, 'node_modules', '.hopon-lock-hash');
if (!existsSync(stamp) || readFileSync(stamp,'utf8') !== hash) {
  run(['ci','--no-audit','--no-fund']);
  writeFileSync(stamp, hash);
}
run(['run','typecheck']);
run(['run','build']);
