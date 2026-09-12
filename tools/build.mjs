import {cp, mkdir, readFile, readdir, rm, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
const gameFiles = [
  'games/little-worlds/index.html',
  'games/little-worlds/styles.css',
  'games/little-worlds/responsive.css',
  'games/little-worlds/app.js',
  'games/little-worlds/audio.js',
  'games/little-worlds/moon-scene.js',
  'games/little-worlds/aurora-scene.js',
  'games/little-worlds/data/manifest.json',
  'games/little-worlds/data/levels/moon-garden.json',
  'games/little-worlds/data/levels/aurora-outpost.json',
  'games/little-worlds/data/kernels/moon-garden.mjs',
  'games/little-worlds/data/kernels/aurora-outpost.mjs',
  'games/little-worlds/vendor/three.module.js',
  'games/little-worlds/vendor/three.core.js',
  'games/little-worlds/vendor/THREE-LICENSE',
];
const aiCraftedGameFiles = [
  'games/ai-crafted-worlds/index.html',
  'games/ai-crafted-worlds/assets/game.js',
  'games/ai-crafted-worlds/assets/standalone.css',
  'games/ai-crafted-worlds/assets/responsive.css',
  ...['lulu-snow-night', 'snow-dragon-rescue', 'snow-fox-survival', 'revised-platform-route']
    .map(name => `games/ai-crafted-worlds/data/${name}.json`),
];

// Publish an explicit public-file allowlist. Never copy a parent directory,
// manuscript, Git metadata, source credentials, or local review material.
const files = [
  '.nojekyll', 'index.html', 'site/guide.css', 'site/guide.js', 'site/catalog.mjs',
  'data/references.json', 'data/survey-references.bib',
  'assets/project-logo.png', 'assets/project-favicon.png', 'assets/game-world.webp',
  'assets/CREDITS.md',
  ...['sec_intro', 'sec2', 'sec3', 'sec4', 'sec5', 'sec6', 'sec7']
    .map(name => `assets/survey-map/${name}.webp`),
  ...['sophy', 'gamengen', 'mariogpt', 'gamecraft', 'nights', 'ea-testing']
    .map(name => `assets/gallery/${name}.webp`),
  ...['moon-garden', 'aurora-outpost', 'lulu-snow-night', 'snow-dragon-rescue', 'snow-fox-survival', 'revised-platform-route']
    .map(name => `assets/playable/${name}.webp`),
  ...gameFiles,
  ...aiCraftedGameFiles,
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
    const localPath = ref.split(/[?#]/)[0];
    const publicPath = localPath.endsWith('/') ? `${localPath}index.html` : localPath;
    assert(files.includes(publicPath), `Unlisted local dependency: ${ref}`);
  }
}
assert(!/\.pdf(?:["?#\s]|$)|\.tex\b/i.test(html), 'A PDF or TeX source was linked from the public page');
const gameHtml = await readFile(path.join(out, 'games/little-worlds/index.html'), 'utf8');
assert(!/\b(?:href|src)="\//.test(gameHtml), 'Playable game page contains a root-relative local reference');
const gameManifest = JSON.parse(await readFile(path.join(out, 'games/little-worlds/data/manifest.json'), 'utf8'));
assert.deepEqual(Object.keys(gameManifest.games).sort(), ['aurora-outpost', 'moon-garden']);
for (const game of Object.values(gameManifest.games)) {
  assert(game.kernelUrl.startsWith('./data/kernels/'));
  assert(game.levelsUrl.startsWith('./data/levels/'));
}
const publicFiles=await Promise.all(files.map(async file=>({file,info:await stat(path.join(out,file))})));
assert(publicFiles.every(({file})=>!file.toLowerCase().endsWith('.pdf')),'The site build must never contain the manuscript PDF');
const bytes = publicFiles.reduce((n, {info}) => n+info.size, 0);
console.log(`Public build ready: ${files.length} files, ${(bytes/1024/1024).toFixed(2)} MB. All local references and anchors resolved.`);
