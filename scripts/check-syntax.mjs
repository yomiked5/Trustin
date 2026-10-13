// Parse every shipped script before event-contract tests transform module imports.
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const scripts = [];
function visit(directory) {
  for (const entry of readdirSync(directory, {withFileTypes:true})) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) visit(path);
    else if (/\.(?:js|mjs)$/.test(entry.name)) scripts.push(path);
  }
}
visit(root);
let failed = false;
for (const script of scripts) {
  const result = spawnSync(process.execPath, ['--check', script], {encoding:'utf8'});
  if (result.status !== 0) {
    failed = true;
    process.stderr.write(result.stderr || String(result.error || 'Syntax check failed: ' + script));
  }
}
if (failed) process.exitCode = 1;
else process.stdout.write(`Passed: JavaScript syntax for all ${scripts.length} shipped JS/MJS files.\n`);
