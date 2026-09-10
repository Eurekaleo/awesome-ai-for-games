import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {FILTER_LABELS, searchPapers, sortPapers, safePaperUrl, escapeHtml} from '../site/catalog.mjs';

const {papers} = JSON.parse(await readFile(new URL('../data/references.json', import.meta.url)));
const expectedRoles = {
  play: 'Play & Act', model: 'Model Games & Players', design: 'Design',
  build: 'Build & Maintain', runtime: 'Generate & Adapt at Runtime', test: 'Test & Evaluate',
};
assert.deepEqual(Object.fromEntries(Object.entries(FILTER_LABELS).filter(([key]) => key !== 'context')), expectedRoles);
assert.equal(papers.length, 417);
assert.equal(new Set(papers.map(p => p.id)).size, papers.length);
assert(papers.every(p => Object.hasOwn(FILTER_LABELS, p.primaryRole)));
assert(papers.every(p => !p.url || safePaperUrl(p.url)));
assert(papers.every(p => p.primaryRole==='context' || p.roles.includes(p.primaryRole)));
assert.equal(papers.filter(p=>p.primaryRole==='context').length,25);
assert.equal(searchPapers(papers).length, papers.length);
assert.equal(searchPapers(papers, {role:'build'}).length, 20);
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
console.log('Catalog checks passed: records, categories, combined filters, search, sort, URLs, and escaping.');
