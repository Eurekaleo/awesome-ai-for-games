import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {FILTER_LABELS, searchPapers, sortPapers, safePaperUrl, escapeHtml} from '../site/catalog.mjs';

const {papers} = JSON.parse(await readFile(new URL('../data/references.json', import.meta.url)));
const expectedRoles = {
  play: 'Play & Act', model: 'Model Games & Players', design: 'Design',
  build: 'Build & Maintain', runtime: 'Generate & Adapt at Runtime', test: 'Test & Evaluate',
};
assert.deepEqual(Object.fromEntries(Object.entries(FILTER_LABELS).filter(([key]) => key !== 'context')), expectedRoles);
assert(papers.length >= 417, 'The public collection unexpectedly lost records');
assert.equal(new Set(papers.map(p => p.id)).size, papers.length);
assert(papers.every(p => p.title && p.authors && p.year > 0 && p.url), 'Every reference needs a title, authors, year, and URL');
assert(papers.every(p => Object.hasOwn(FILTER_LABELS, p.primaryRole)));
assert(papers.every(p => !p.url || safePaperUrl(p.url)));
assert(papers.every(p => p.primaryRole==='context' || p.roles.includes(p.primaryRole)));
assert.equal(papers.filter(p=>p.primaryRole==='context').length,25);
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
assert(searchPapers(papers, {role:'build'}).length >= 20);
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
const contextCount = searchPapers(papers, {role:'context'}).length;
const coreCount = papers.length - contextCount;
assert(readme.includes(`references-${papers.length}`), 'README reference badge is stale');
assert(readme.includes(`core%20works-${coreCount}`), 'README core-work badge is stale');
assert(html.includes(`bibliography of ${papers.length} references`), 'Website description count is stale');
assert(html.includes(`id="paper-count">${papers.length}</strong>`), 'Website hero count is stale');
for (const [role, label] of Object.entries(expectedRoles)) {
  const readmeLabel = label.replaceAll('&', 'and');
  assert(readme.includes(`## ${readmeLabel}`), `README is missing the ${role} collection`);
  const listed = searchPapers(papers, {role}).length;
  const section = readme.split(`## ${readmeLabel}`)[1]?.split('\n## ')[0] ?? '';
  assert.equal((section.match(/^- (?:⭐ )?\[/gm) ?? []).length, listed, `README ${role} count does not match the data`);
  assert(html.includes(`data-count="${role}">${listed}</b>`), `Website ${role} filter count is stale`);
  assert(new RegExp(`\\b${role}: \\{[\\s\\S]{0,100}count:${listed},`).test(guide), `Website ${role} fallback count is stale`);
}
assert.equal((readme.split('## Foundations and Context')[1]?.split('\n## ')[0].match(/^- (?:⭐ )?\[/gm) ?? []).length, contextCount);
console.log('Catalog checks passed: records, metadata, categories, filters, search, sort, URLs, README synchronization, and escaping.');
