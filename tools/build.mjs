import {cp, mkdir, readFile, readdir, rm, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');

// Publish an explicit public-file allowlist. Never copy a parent directory,
// manuscript, Git metadata, source credentials, or local review material.
const files = [
  'index.html', 'site/guide.css', 'site/guide.js', 'site/catalog.mjs',
  'data/papers.json', 'assets/site-icon.svg', 'assets/game-world.webp',
  'assets/CREDITS.md',
  ...['sophy', 'gamengen', 'mariogpt', 'gamecraft', 'nights', 'ea-testing']
    .map(name => `assets/gallery/${name}.webp`),
];
for (const file of files) {
  const info = await stat(path.join(root, file));
  assert(info.isFile() && info.size > 0, `Missing or empty public file: ${file}`);
}
assert.equal(path.dirname(out), path.resolve(root));
await mkdir(out, {recursive: true});
// This script owns only the dedicated build output.
for (const entry of await readdir(out)) await rm(path.join(out, entry), {recursive: true, force: true});
for (const file of files) {
  await mkdir(path.dirname(path.join(out, file)), {recursive: true});
  await cp(path.join(root, file), path.join(out, file));
}
const html = await readFile(path.join(out, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML IDs');
for (const [, ref] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
  if (ref.startsWith('#')) assert(ids.includes(ref.slice(1)), `Missing anchor: ${ref}`);
  else if (!/^(https?:|data:|mailto:)/.test(ref)) {
    assert(files.includes(ref.split(/[?#]/)[0]), `Unlisted local dependency: ${ref}`);
  }
}
assert(!/\.pdf(?:["?#\s]|$)|\.tex\b|RQ[123]\b|chapter\s*\d/i.test(html), 'Private manuscript reference in public HTML');
const bytes = (await Promise.all(files.map(f => stat(path.join(out, f))))).reduce((n, s) => n+s.size, 0);
console.log(`Public build ready: ${files.length} files, ${(bytes/1024/1024).toFixed(2)} MB. All local references and anchors resolved.`);
