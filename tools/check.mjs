import assert from 'node:assert/strict';
import {access, readFile} from 'node:fs/promises';
import {FILTER_LABELS, searchPapers, sortPapers, safePaperUrl, escapeHtml} from '../site/catalog.mjs';

const {papers, sourceCounts} = JSON.parse(await readFile(new URL('../data/references.json', import.meta.url)));
const paperBib = await readFile(new URL('../data/paper-references.bib', import.meta.url), 'utf8');
const additionsBib = await readFile(new URL('../data/living-additions.bib', import.meta.url), 'utf8');
const roleMap = JSON.parse(await readFile(new URL('../data/role-citations.json', import.meta.url), 'utf8'));
const countBibEntries = source => [...source.matchAll(/^@\w+\s*\{/gm)].length;
const paperReferenceCount = countBibEntries(paperBib);
const livingAdditionCount = countBibEntries(additionsBib);
const expectedRoles = {
  play: 'Play & Act', model: 'Model Players & Games', design: 'Design',
  build: 'Build & Maintain', runtime: 'Generate & Adapt at Runtime', test: 'Test & Evaluate',
};
assert.deepEqual(Object.fromEntries(Object.entries(FILTER_LABELS).filter(([key]) => key !== 'context')), expectedRoles);
assert.equal(paperReferenceCount, 436, 'The manuscript bibliography is not synchronized with the current paper');
assert.equal(livingAdditionCount, 3, 'The catalog-only additions changed unexpectedly');
assert.equal(papers.length, paperReferenceCount + livingAdditionCount, 'The public collection is not the manuscript bibliography plus living additions');
assert.deepEqual(sourceCounts, {manuscript:paperReferenceCount,livingAdditions:livingAdditionCount});
assert.equal(new Set(papers.map(p => p.id)).size, papers.length);
assert(papers.every(p => p.title && p.authors && p.year > 0 && p.url), 'Every reference needs a title, authors, year, and URL');
assert(papers.every(p => Object.hasOwn(FILTER_LABELS, p.primaryRole)));
assert(papers.every(p => !p.url || safePaperUrl(p.url)));
assert(papers.every(p => p.primaryRole==='context' || p.roles.includes(p.primaryRole)));
const byId = new Map(papers.map(p => [p.id, p]));
for (const [key, role] of Object.entries(roleMap.primary)) {
  assert(byId.has(key), `System-table role badge has no bibliography record: ${key}`);
  assert.equal(byId.get(key).primaryRole, role, `Primary role drifted from manuscript system table: ${key}`);
}
assert.deepEqual(byId.get('huang2026guigames').roles.filter(role => ['build','test'].includes(role)).sort(), ['build','test']);
assert.equal(byId.get('huang2026guigames').primaryRole, 'build');
assert.equal(byId.get('huang2026programmable').primaryRole, 'model');
assert(byId.get('huang2026programmable').roles.includes('build'));
assert(papers.filter(p=>p.primaryRole==='context').length > 0, 'Supporting context is missing');
const normalizedUrls = papers.map(p => p.url
  .replace(/^https?:\/\/(?:www\.)?/i, '')
  .replace(/arxiv\.org\/(?:abs|pdf)\/([0-9]{4}\.[0-9]{4,5})(?:v\d+)?(?:\.pdf)?$/i, 'arxiv.org/abs/$1')
  .replace(/#.*$/, '')
  .replace(/([?&])utm_[^&]+&?/gi, '$1')
  .replace(/[?&]$/, '')
  .replace(/\/$/, '')
  .toLowerCase());
assert.equal(new Set(normalizedUrls).size, normalizedUrls.length, 'Duplicate canonical URLs in the reference index');
assert.equal(searchPapers(papers).length, papers.length);
assert(searchPapers(papers, {role:'build'}).length >= 15);
assert(searchPapers(papers, {query:'MarioGPT'}).some(p => p.title.includes('MarioGPT')));
assert.equal(searchPapers(papers, {query:'GameNGen'}).length, 1);
assert.equal(searchPapers(papers, {query:'GameNGen', role:'model', year:'2025'}).length, 1);
assert.equal(searchPapers(papers, {query:'GameNGen', role:'play'}).length, 0);
assert.equal(searchPapers(papers, {query:'nonexistent-paper-zzz'}).length, 0);
assert(searchPapers(papers, {year:'2026'}).every(p => p.year === 2026));
assert.equal(safePaperUrl('javascript:alert(1)'), null);
assert.equal(safePaperUrl('data:text/html,hello'), null);
assert.equal(escapeHtml('<img src="x">'), '&lt;img src=&quot;x&quot;&gt;');
const sorted = sortPapers(papers);
assert(sorted.every((p, i) => !i || Number(p.year) <= Number(sorted[i-1].year)));
assert.notEqual(sorted, papers);
const gameManifest = JSON.parse(await readFile(new URL('../games/little-worlds/data/manifest.json', import.meta.url)));
for (const gameId of ['moon-garden', 'aurora-outpost']) {
  const game = gameManifest.games[gameId];
  assert(game, `Missing playable game manifest entry: ${gameId}`);
  const levels = JSON.parse(await readFile(new URL(`../games/little-worlds/data/levels/${gameId}.json`, import.meta.url)));
  assert(Array.isArray(levels) && levels.length === 3, `${gameId} must expose three playable levels`);
  const kernel = await import(new URL(`../games/little-worlds/data/kernels/${gameId}.mjs`, import.meta.url));
  assert.equal(typeof kernel.createGame, 'function');
  assert.equal(typeof kernel.stepGame, 'function');
  const state = kernel.createGame(levels[0]);
  assert(state && typeof state === 'object', `${gameId} did not create an initial game state`);
}
const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const guide = await readFile(new URL('../site/guide.js', import.meta.url), 'utf8');
const paperPath = 'paper/AI_for_Games_in_the_Foundation_Model_Era.pdf';
await access(new URL(`../${paperPath}`, import.meta.url));
assert(readme.includes(paperPath), 'README does not link the final paper');
assert(html.includes(paperPath), 'Website does not link the final paper');
const contextCount = searchPapers(papers, {role:'context'}).length;
const coreCount = papers.length - contextCount;
assert(readme.includes(`references-${papers.length}`), 'README reference badge is stale');
assert(readme.includes(`core%20works-${coreCount}`), 'README core-work badge is stale');
assert(readme.includes('assets/game-world.webp'), 'README project artwork is missing');
for (const [, source] of readme.matchAll(/<img\s+[^>]*src="([^"]+)"/g)) {
  if (!/^https?:\/\//i.test(source)) await access(new URL(`../${source}`, import.meta.url));
}
assert(html.includes(`bibliography of ${papers.length} references`), 'Website description count is stale');
assert(html.includes(`id="paper-count">${papers.length}</strong>`), 'Website hero count is stale');
assert(html.includes(`Search ${paperReferenceCount} current manuscript references and ${livingAdditionCount === 3 ? 'three' : livingAdditionCount} separately tracked public additions`), 'Website manuscript-versus-catalog distinction is stale');
for (const figure of ['figure-3-timeline','figure-4a-knowledge','figure-4b-knowledge']) {
  assert(html.includes(`assets/survey-map/${figure}.webp`), `Manuscript visual is missing from the website: ${figure}`);
}
for (const phrase of ['Perceptual quality','Mechanics correctness','Persistent state','A new map is not a new game','full UE/Unity development-to-rendering workflow']) {
  assert(html.includes(phrase), `Manuscript synthesis is missing from the website: ${phrase}`);
}
for (const [role, label] of Object.entries(expectedRoles)) {
  const readmeLabel = label.replaceAll('&', 'and');
  assert(readme.includes(`## ${readmeLabel}`), `README is missing the ${role} collection`);
  assert(readme.includes(`assets/readme/role-${role}.svg`), `README role card is missing: ${role}`);
  const listed = searchPapers(papers, {role}).length;
  const section = readme.split(`## ${readmeLabel}`)[1]?.split('\n## ')[0] ?? '';
  assert.equal((section.match(/^- (?:\*\*\d{4}\*\* · )?(?:⭐ )?\[/gm) ?? []).length, listed, `README ${role} count does not match the data`);
  assert(html.includes(`data-count="${role}">${listed}</b>`), `Website ${role} filter count is stale`);
  assert(new RegExp(`\\b${role}: \\{[\\s\\S]{0,100}count:${listed},`).test(guide), `Website ${role} fallback count is stale`);
}
assert.equal((readme.split('## Foundations and Context')[1]?.split('\n## ')[0].match(/^- (?:\*\*\d{4}\*\* · )?(?:⭐ )?\[/gm) ?? []).length, contextCount);
console.log('Catalog checks passed: records, metadata, categories, filters, search, sort, URLs, README synchronization, and escaping.');
