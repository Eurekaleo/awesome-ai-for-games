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
const classicArcadeGameFiles = [
  'games/classic-arcade/index.html',
  'games/classic-arcade/favicon.svg',
  'games/classic-arcade/THIRD_PARTY.md',
  'games/classic-arcade/licenses/Matter-LICENSE.txt',
  'games/classic-arcade/licenses/Three-LICENSE.txt',
  ...['art-BG4L1Jxi.js', 'garden-BiGi3edg.js', 'index-DnjKx9R_.js',
    'kart-CkkHUYKs.js', 'sling-F_lZp23b.js', 'index-BtmSr1TE.css']
    .map(name => `games/classic-arcade/assets/${name}`),
  ...['garden', 'garden-en', 'kart', 'kart-en', 'sling', 'sling-en']
    .map(name => `games/classic-arcade/previews/${name}.png`),
];
const topicPageFiles = [
  'game-agents', 'game-world-models', 'ai-game-design', 'ai-game-development',
  'runtime-generation', 'automated-game-testing',
].map(slug => `${slug}/index.html`);

// Publish an explicit public-file allowlist. Never copy a parent directory,
// Git metadata, source credentials, or local review material.
const files = [
  '.nojekyll', 'favicon.ico', 'robots.txt', 'sitemap.xml', 'site.webmanifest', 'index.html', 'site/guide.css', 'site/guide.js', 'site/catalog.mjs', 'site/topic.css',
  'data/references.json', 'data/survey-references.bib',
  'paper/AI_for_Games_in_the_Foundation_Model_Era.pdf',
  'assets/project-logo.png', 'assets/project-favicon.png', 'assets/project-icon-192.png',
  'assets/project-icon-512.png', 'assets/apple-touch-icon.png', 'assets/game-world.webp',
  'assets/video/ai-for-games-introduction.mp4', 'assets/video/ai-for-games-introduction-poster.webp',
  'assets/CREDITS.md',
  ...['sec_intro', 'sec2', 'sec3', 'sec4', 'sec5', 'sec6', 'sec7',
    'figure-3-timeline', 'figure-4a-knowledge', 'figure-4b-knowledge']
    .map(name => `assets/survey-map/${name}.webp`),
  ...['sophy', 'gamengen', 'mariogpt', 'gamecraft', 'nights', 'ea-testing']
    .map(name => `assets/gallery/${name}.webp`),
  ...['cloud-sling', 'sprout-guard', 'neon-kart', 'moon-garden', 'aurora-outpost', 'lulu-snow-night', 'snow-dragon-rescue', 'snow-fox-survival', 'revised-platform-route']
    .map(name => `assets/playable/${name}.webp`),
  ...gameFiles,
  ...aiCraftedGameFiles,
  ...classicArcadeGameFiles,
  ...topicPageFiles,
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
for (const topicFile of topicPageFiles) {
  const topicHtml = await readFile(path.join(out, topicFile), 'utf8');
  const topicIds = [...topicHtml.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(topicIds).size, topicIds.length, `Duplicate HTML IDs: ${topicFile}`);
  for (const [, ref] of topicHtml.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    if (ref.startsWith('#')) assert(topicIds.includes(ref.slice(1)), `Missing anchor in ${topicFile}: ${ref}`);
    else if (!/^(https?:|data:|mailto:)/.test(ref)) {
      const localPath = ref.split(/[?#]/)[0];
      const publicPath = localPath.endsWith('/') ? `${localPath}index.html` : localPath;
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(topicFile), publicPath));
      assert(files.includes(resolved), `Unlisted local dependency in ${topicFile}: ${ref}`);
    }
  }
}
assert(!/\.tex\b/i.test(html), 'A TeX source was linked from the public page');
assert(html.includes('https://arxiv.org/pdf/2609.16679'), 'The arXiv paper is not linked from the public page');
const gameHtml = await readFile(path.join(out, 'games/little-worlds/index.html'), 'utf8');
assert(!/\b(?:href|src)="\//.test(gameHtml), 'Playable game page contains a root-relative local reference');
const classicArcadeHtml = await readFile(path.join(out, 'games/classic-arcade/index.html'), 'utf8');
assert(!/\b(?:href|src)="\//.test(classicArcadeHtml), 'Classic Arcade contains a root-relative local reference');
const gameManifest = JSON.parse(await readFile(path.join(out, 'games/little-worlds/data/manifest.json'), 'utf8'));
assert.deepEqual(Object.keys(gameManifest.games).sort(), ['aurora-outpost', 'moon-garden']);
for (const game of Object.values(gameManifest.games)) {
  assert(game.kernelUrl.startsWith('./data/kernels/'));
  assert(game.levelsUrl.startsWith('./data/levels/'));
}
const publicFiles=await Promise.all(files.map(async file=>({file,info:await stat(path.join(out,file))})));
assert.deepEqual(publicFiles.filter(({file})=>file.toLowerCase().endsWith('.pdf')).map(({file})=>file), ['paper/AI_for_Games_in_the_Foundation_Model_Era.pdf']);
const bytes = publicFiles.reduce((n, {info}) => n+info.size, 0);
console.log(`Public build ready: ${files.length} files, ${(bytes/1024/1024).toFixed(2)} MB. All local references and anchors resolved.`);
