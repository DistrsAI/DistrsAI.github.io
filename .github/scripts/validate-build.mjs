import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';

const root = resolve('.');
function asset(path) {
  const file = resolve(root, `.${path}`);
  const rel = relative(root, file);
  assert.ok(!rel.startsWith('..') && !isAbsolute(rel), 'Asset escapes site root');
  assert.ok(existsSync(file), `Missing asset: ${path}`);
  return readFileSync(file, 'utf8');
}
const html = readFileSync('index.html', 'utf8');
const modules = [...html.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(match => match[1]);
assert.equal(modules.length, 1);
const js = asset(modules[0]);
assert.ok(js.includes('expectedRevision') && js.includes('requestId'), 'Missing persistent save protocol');
assert.ok(js.includes('https://after-hours-api.vercel.app'), 'Wrong baked API fallback');
for (const match of html.matchAll(/(?:href|src)="(\/[^"?#]+)"/g)) asset(match[1]);
for (const match of js.matchAll(/"(\/art\/[^"?]+\.(?:svg|webp))"/g)) asset(match[1]);
assert.equal(readFileSync('api-base.txt', 'utf8').trim(), 'https://after-hours-api.vercel.app');
assert.ok(existsSync('.nojekyll'));
assert.ok(html.includes('id="root"'));
console.log('Prepared frontend assets, persistent saves, API address and .nojekyll: OK');
