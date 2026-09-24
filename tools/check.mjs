import assert from 'node:assert/strict';
import {access, readFile} from 'node:fs/promises';
import {FILTER_LABELS, searchPapers, sortPapers, safePaperUrl, escapeHtml} from '../site/catalog.mjs';

const {papers, sourceCounts} = JSON.parse(await readFile(new URL('../data/references.json', import.meta.url)));
const paperBib = await readFile(new URL('../data/paper-references.bib', import.meta.url), 'utf8');
const additionsBib = await readFile(new URL('../data/living-additions.bib', import.meta.url), 'utf8');
const roleMap = JSON.parse(await readFile(new URL('../data/role-citations.json', import.meta.url), 'utf8'));
const officialResourceData = JSON.parse(await readFile(new URL('../data/official-resources.json', import.meta.url), 'utf8'));
const countBibEntries = source => [...source.matchAll(/^@\w+\s*\{/gm)].length;
const paperReferenceCount = countBibEntries(paperBib);
const livingAdditionCount = countBibEntries(additionsBib);
const expectedRoles = {
  play: 'Play & Act', model: 'Model Players & Games', design: 'Design',
  build: 'Build & Maintain', runtime: 'Generate & Adapt at Runtime', test: 'Test & Evaluate',
};
assert.deepEqual(Object.fromEntries(Object.entries(FILTER_LABELS).filter(([key]) => key !== 'context')), expectedRoles);
assert.equal(paperReferenceCount, 436, 'The manuscript bibliography is not synchronized with the current paper');
assert.equal(livingAdditionCount, 9, 'The catalog-only additions changed unexpectedly');
assert.equal(papers.length, paperReferenceCount + livingAdditionCount, 'The public collection is not the manuscript bibliography plus living additions');
assert.deepEqual(sourceCounts, {manuscript:paperReferenceCount,livingAdditions:livingAdditionCount});
assert.equal(new Set(papers.map(p => p.id)).size, papers.length);
assert(papers.every(p => p.title && p.authors && p.year > 0 && p.url), 'Every reference needs a title, authors, year, and URL');
assert(papers.every(p => Object.hasOwn(FILTER_LABELS, p.primaryRole)));
assert(papers.every(p => !p.url || safePaperUrl(p.url)));
const allowedResourceTypes = new Set(['code','project','demo','data','results']);
for (const paper of papers) {
  const resources = paper.resources ?? [];
  assert(Array.isArray(resources), `Resources must be an array: ${paper.id}`);
  assert(resources.every(resource => allowedResourceTypes.has(resource.type) && safePaperUrl(resource.url)), `Invalid resource metadata: ${paper.id}`);
  const resourceUrls = [paper.url, ...resources.map(resource => resource.url)].map(url => url.toLowerCase().replace(/\/$/, ''));
  assert.equal(new Set(resourceUrls).size, resourceUrls.length, `Duplicate resource URL: ${paper.id}`);
}
assert.equal(Object.keys(officialResourceData.resources).length, 127, 'The verified official-resource index changed unexpectedly');
assert.deepEqual(Object.keys(officialResourceData.resources).filter(key => !papers.some(paper => paper.id === key)), [], 'Official-resource index contains unknown references');
const officialResourceCount = Object.values(officialResourceData.resources).flat().length;
assert.equal(papers.reduce((total, paper) => total + (paper.resources?.length ?? 0), 0), officialResourceCount, 'Generated references lost official-resource metadata');
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
assert.equal(byId.get('choi2026d2e').primaryRole, 'play');
assert.equal(byId.get('guo2026gamewam').primaryRole, 'play');
assert.deepEqual(byId.get('guo2026gamewam').resources.map(resource => resource.type), ['code', 'project']);
assert.equal(byId.get('mineamongus2026').primaryRole, 'play');
assert.deepEqual(byId.get('mineamongus2026').resources.map(resource => resource.type), ['code', 'project', 'data']);
assert.equal(byId.get('jang2026coverage').primaryRole, 'test');
assert.deepEqual(byId.get('jang2026coverage').resources.map(resource => resource.type), ['code']);
assert.deepEqual(byId.get('choi2026d2e').topics.slice(0, 2), ['game-to-real-transfer', 'vision-action-pretraining']);
assert.equal(byId.get('choi2026d2e').note, 'Game-to-real transfer · vision–action pretraining');
assert.equal(byId.get('tong2026gamerl').primaryRole, 'context');
assert.equal(byId.get('kang2026simworldstudio').primaryRole, 'build');
assert.equal(byId.get('magne2026nitrogen').note, 'CVPR 2026 Best Paper Honorable Mention');
assert.equal(byId.get('kang2026simworldstudio').note, 'Future-facing direction');
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
const robots = await readFile(new URL('../robots.txt', import.meta.url), 'utf8');
const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
const siteUrl = 'https://eurekaleo.github.io/awesome-ai-for-games/';
assert.match(robots, /User-agent: OAI-SearchBot\s+Allow: \//, 'OAI-SearchBot must be allowed to crawl the site');
assert.match(robots, /User-agent: GPTBot\s+Disallow: \//, 'GPTBot must remain disallowed from training crawls');
assert(robots.includes(`Sitemap: ${siteUrl}sitemap.xml`), 'robots.txt must advertise the sitemap');
assert(sitemap.includes(`<loc>${siteUrl}</loc>`), 'The canonical homepage is missing from the sitemap');
assert(html.includes('<meta name="robots" content="index, follow">'), 'The homepage must remain indexable');
assert(html.includes('<link rel="sitemap" type="application/xml" href="sitemap.xml">'), 'The homepage must advertise the sitemap');
const citationMeta = Object.fromEntries([...html.matchAll(/<meta name="(citation_[^"]+)" content="([^"]*)">/g)].map(([, name, content]) => [name, content]));
const citationAuthors = [...html.matchAll(/<meta name="citation_author" content="([^"]+)">/g)].map(([, author]) => author);
const expectedArticleAuthors = ['Meng Luo', 'Yanlin Li', 'Hao Li', 'Hongzhan Lin', 'Pengfei Zhou', 'Tianjie Ju', 'Ran Zhang', 'Yeying Jin', 'Mong-Li Lee', 'Wynne Hsu'];
assert.equal(citationMeta.citation_title, 'AI for Games in the Foundation Model Era', 'Scholarly citation title is missing');
assert.deepEqual(citationAuthors, expectedArticleAuthors, 'Scholarly citation authors are missing or out of order');
assert.equal(citationMeta.citation_publication_date, '2026-09-15', 'Scholarly publication date is incorrect');
assert.equal(citationMeta.citation_arxiv_id, '2609.16679', 'arXiv identifier is incorrect');
assert.equal(citationMeta.citation_doi, '10.48550/arXiv.2609.16679', 'arXiv DOI is incorrect');
assert.equal(citationMeta.citation_pdf_url, 'https://arxiv.org/pdf/2609.16679', 'Scholarly PDF URL is incorrect');
assert(citationMeta.citation_abstract.includes('six roles'), 'Scholarly abstract is incomplete');
const scholarlyMatch = html.match(/<script type="application\/ld\+json">\s*({[\s\S]*?})\s*<\/script>/);
assert(scholarlyMatch, 'ScholarlyArticle JSON-LD is missing');
const scholarlyArticle = JSON.parse(scholarlyMatch[1]);
assert.equal(scholarlyArticle['@type'], 'ScholarlyArticle', 'JSON-LD type must be ScholarlyArticle');
assert.equal(scholarlyArticle.datePublished, '2026-09-15', 'JSON-LD publication date is incorrect');
assert.deepEqual(scholarlyArticle.author.map(author => author.name), expectedArticleAuthors, 'JSON-LD authors are missing or out of order');
assert(scholarlyArticle.identifier.some(identifier => identifier?.propertyID === 'arXiv' && identifier.value === '2609.16679'), 'JSON-LD arXiv identifier is missing');
assert(scholarlyArticle.sameAs.includes(siteUrl), 'JSON-LD project page relationship is missing');
assert(scholarlyArticle.sameAs.includes('https://github.com/Eurekaleo/awesome-ai-for-games'), 'JSON-LD GitHub relationship is missing');
assert.equal(scholarlyArticle.mainEntityOfPage['@id'], siteUrl, 'JSON-LD main entity page is incorrect');
assert(scholarlyArticle.keywords.includes('automated game testing'), 'JSON-LD keywords are incomplete');
const summaryStart = html.indexOf('id="survey-summary"');
assert(summaryStart > html.indexOf('class="hero"') && summaryStart < html.indexOf('id="authors"'), 'The machine-readable survey summary must stay near the top of the homepage');
for (const phrase of ['foundation models for games', 'LLMs', 'game-playing agents', 'world models', 'AI-assisted game design and development', 'automated game testing', 'Play &amp; Act', 'Test &amp; Evaluate']) {
  assert(html.includes(phrase), `Survey summary is missing a key concept: ${phrase}`);
}
assert(html.includes('Questions this AI for games survey helps answer'), 'Homepage query guide is missing');
assert(html.includes('generative AI for games'), 'Homepage query guide is missing its generative-AI framing');
const topicPages = {
  'game-agents': {
    title: 'Foundation Models and LLM Agents for Games',
    question: 'How are LLMs used in games?',
    queries: ['LLMs in games', 'LLM game agents', 'AI NPCs'],
  },
  'game-world-models': {
    title: 'Foundation Models for Game World and Player Modeling',
    question: 'What are world models for games?',
    queries: ['World models for games'],
  },
  'ai-game-design': {
    title: 'AI and Foundation Models for Game Design',
    question: 'What is generative game design?',
    queries: ['Generative game design', 'Generative AI for games'],
  },
  'ai-game-development': {
    title: 'Foundation Models for Game Development and Maintenance',
    question: 'How is AI used in game development?',
    queries: ['AI game development'],
  },
  'runtime-generation': {
    title: 'Runtime Generation and Adaptation with Foundation Models',
    question: 'How does generative AI adapt games at runtime?',
    queries: ['Generative AI for games at runtime'],
  },
  'automated-game-testing': {
    title: 'AI and Foundation Models for Automated Game Testing and Evaluation',
    question: 'What are automated game testing and AI playtesting?',
    queries: ['Automated game testing', 'AI playtesting'],
  },
};
for (const [slug, {title, question, queries}] of Object.entries(topicPages)) {
  const topicHtml = await readFile(new URL(`../${slug}/index.html`, import.meta.url), 'utf8');
  const topicUrl = `${siteUrl}${slug}/`;
  assert(topicHtml.includes(`<title>${title} | AI for Games</title>`), `Topic title is missing: ${slug}`);
  assert(topicHtml.includes(`<h1>${title}</h1>`), `Topic H1 is missing: ${slug}`);
  assert(topicHtml.includes(`<link rel="canonical" href="${topicUrl}">`), `Topic canonical URL is missing: ${slug}`);
  assert(topicHtml.includes('<meta name="description"'), `Topic description is missing: ${slug}`);
  assert(topicHtml.includes('<meta name="robots" content="index, follow">'), `Topic is not explicitly indexable: ${slug}`);
  assert(topicHtml.includes('<script type="application/ld+json">'), `Topic structured data is missing: ${slug}`);
  assert(topicHtml.includes('This topic is surveyed in'), `Survey attribution is missing: ${slug}`);
  assert(topicHtml.includes(`>${question}</h2>`), `Natural-language topic question is missing: ${slug}`);
  const answerBlock = topicHtml.match(/<div class="topic-answer-copy">([\s\S]*?)<p class="survey-note">/)?.[1] ?? '';
  const answerParagraphs = [...answerBlock.matchAll(/<p class="topic-answer">([\s\S]*?)<\/p>/g)].map(match => match[1]);
  assert(answerParagraphs.length >= 2 && answerParagraphs.length <= 4, `Topic answer must use 2–4 paragraphs: ${slug}`);
  const answer = answerParagraphs.join(' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').trim();
  const answerWords = answer ? answer.split(/\s+/).length : 0;
  assert(answerWords >= 150 && answerWords <= 300, `Topic answer must be 150–300 words: ${slug} has ${answerWords}`);
  for (const query of queries) {
    assert(answer.toLowerCase().includes(query.toLowerCase()), `Topic answer is missing a natural query phrase in ${slug}: ${query}`);
  }
  assert(html.includes(`href="${slug}/"`), `Homepage does not link to topic: ${slug}`);
  assert(sitemap.includes(`<loc>${topicUrl}</loc>`), `Sitemap does not include topic: ${slug}`);
  for (const relatedSlug of Object.keys(topicPages)) {
    assert(topicHtml.includes(`href="../${relatedSlug}/"`), `Topic navigation is incomplete in ${slug}: ${relatedSlug}`);
  }
}
const playableCards = [...html.matchAll(/<article class="playable-card\b/g)];
assert.equal(playableCards.length, 9, 'The website must present exactly nine playable game cards');
assert(html.includes('NINE AI-CRAFTED WORLDS'), 'The playable-games heading is stale');
for (const game of ['sling', 'garden', 'kart']) {
  assert(html.includes(`games/classic-arcade/?game=${game}&amp;lang=en`), `Classic Arcade entry is missing: ${game}`);
}
for (const asset of ['cloud-sling', 'sprout-guard', 'neon-kart']) {
  await access(new URL(`../assets/playable/${asset}.webp`, import.meta.url));
}
for (const asset of ['index.html', 'favicon.svg', 'THIRD_PARTY.md', 'licenses/Matter-LICENSE.txt', 'licenses/Three-LICENSE.txt']) {
  await access(new URL(`../games/classic-arcade/${asset}`, import.meta.url));
}
const paperPath = 'paper/AI_for_Games_in_the_Foundation_Model_Era.pdf';
const paperUrl = 'https://arxiv.org/pdf/2609.16679';
await access(new URL(`../${paperPath}`, import.meta.url));
assert(readme.includes(paperUrl), 'README does not link the arXiv paper');
assert(html.includes(paperUrl), 'Website does not link the arXiv paper');
assert(!readme.includes(`href="${paperPath}"`), 'README still links the repository PDF');
assert(!html.includes(`href="${paperPath}"`), 'Website still links the repository PDF');
for (const asset of ['favicon.ico', 'site.webmanifest', 'assets/project-favicon.png', 'assets/apple-touch-icon.png', 'assets/project-icon-192.png', 'assets/project-icon-512.png']) {
  await access(new URL(`../${asset}`, import.meta.url));
}
assert(html.includes('rel="icon" href="favicon.ico"'), 'Root favicon is not declared');
assert(html.includes('rel="apple-touch-icon"'), 'Apple touch icon is not declared');
assert(html.includes('rel="manifest" href="site.webmanifest"'), 'Web app manifest is not declared');
assert(html.includes('property="og:image"'), 'Open Graph image is not declared');
assert(html.includes('name="twitter:image"'), 'Twitter image is not declared');
const contextCount = searchPapers(papers, {role:'context'}).length;
const coreCount = papers.length - contextCount;
assert(readme.includes(`references-${papers.length}`), 'README reference badge is stale');
assert(readme.includes(`core%20works-${coreCount}`), 'README core-work badge is stale');
assert(readme.includes('assets/readme/survey-banner.webp'), 'README survey banner is missing');
assert(readme.includes('assets/readme/hero-banner.png'), 'README hero banner is missing');
assert(!readme.includes('<h2><a href="https://arxiv.org/pdf/2609.16679">'), 'README paper title should not duplicate the arXiv link');
assert(readme.includes('https://huggingface.co/papers/2609.16679'), 'README Hugging Face Daily Papers link is missing');
assert(readme.includes('assets/video/ai-for-games-introduction-poster.webp'), 'README video cover is missing');
assert(readme.includes('https://eurekaleo.github.io/awesome-ai-for-games/#video'), 'README introduction video link is missing');
assert(!readme.includes('github.com/user-attachments/'), 'README should not expose a GitHub attachment player');
assert(!readme.includes('ai-for-games-introduction-new.mp4'), 'README should not expose an internal video filename');
assert(readme.includes('## Citation'), 'README citation section is missing');
assert(readme.includes('@misc{luo2026aigamesfoundationmodel,'), 'README BibTeX citation is missing');
assert(readme.includes('url          = {https://arxiv.org/abs/2609.16679}'), 'README citation URL is malformed');
assert(readme.includes('## Star History'), 'README star-history section is missing');
assert(readme.includes('https://github.com/Eurekaleo/awesome-ai-for-games/stargazers'), 'README stargazer link is missing');
assert(readme.includes('assets/readme/star-history-dark.svg'), 'README dark-theme star-history chart is missing');
assert(readme.includes('assets/readme/star-history-light.svg'), 'README light-theme star-history chart is missing');
assert(readme.indexOf('## Star History') < readme.indexOf('## Citation'), 'README citation must remain the final section after star history');
await access(new URL('../assets/readme/star-history-light.svg', import.meta.url));
await access(new URL('../assets/readme/star-history-dark.svg', import.meta.url));
for (const author of ['Meng Luo', 'Yanlin Li', 'Hao Li', 'Hongzhan Lin', 'Pengfei Zhou', 'Tianjie Ju', 'Ran Zhang', 'Yeying Jin', 'Mong-Li Lee', 'Wynne Hsu']) {
  assert(readme.includes(author), `README author is missing: ${author}`);
  assert(html.includes(author), `Website author is missing: ${author}`);
}
for (const authorUrl of ['eurekaleo.github.io/', 'liyanlin06.github.io/', 'scholar.google.com/citations?user=vF-UH7oAAAAJ', 'daniellin97.github.io/', 'lancezpf.github.io/', 'jometeorie.github.io/', 'openreview.net/profile?id=~Ran_Zhang18', 'jinyeying.github.io/', 'comp.nus.edu.sg/cs/people/leeml/', 'comp.nus.edu.sg/cs/people/whsu/']) {
  assert(readme.includes(authorUrl), `README author link is missing: ${authorUrl}`);
  assert(html.includes(authorUrl), `Website author link is missing: ${authorUrl}`);
}
assert(html.includes('assets/video/ai-for-games-introduction.mp4'), 'Website introduction video is missing');
assert(html.includes('assets/video/ai-for-games-introduction-poster.webp'), 'Website introduction video poster is missing');
for (const [, source] of readme.matchAll(/<img\s+[^>]*src="([^"]+)"/g)) {
  if (!/^https?:\/\//i.test(source)) await access(new URL(`../${source}`, import.meta.url));
}
assert(html.includes(`bibliography of ${papers.length} references`), 'Website description count is stale');
assert(html.includes(`id="paper-count">${papers.length}</strong>`), 'Website hero count is stale');
const livingAdditionLabel = ({6:'six',7:'seven',8:'eight',9:'nine'})[livingAdditionCount] ?? livingAdditionCount;
assert(html.includes(`Search ${paperReferenceCount} current manuscript references and ${livingAdditionLabel} separately tracked public additions`), 'Website manuscript-versus-catalog distinction is stale');
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
  assert.equal((section.match(/^- .*?(?: \[\[(?:paper|code|project|demo|data|source|book|results)\]\(https?:\/\/.*?\)\])+ <img src="assets\/readme\/venues\/[^"]+"[^>]*>/gm) ?? []).length, listed, `README ${role} count does not match the data`);
  assert(html.includes(`data-count="${role}">${listed}</b>`), `Website ${role} filter count is stale`);
  assert(new RegExp(`\\b${role}: \\{[\\s\\S]{0,100}count:${listed},`).test(guide), `Website ${role} fallback count is stale`);
}
assert.equal((readme.split('## Foundations and Context')[1]?.split('\n## ')[0].match(/^- .*?(?: \[\[(?:paper|code|project|demo|data|source|book|results)\]\(https?:\/\/.*?\)\])+ <img src="assets\/readme\/venues\/[^"]+"[^>]*>/gm) ?? []).length, contextCount);
assert.equal((readme.match(/\[\[(?:paper|code|project|demo|data|source|book|results)\]\(https?:\/\//g) ?? []).length, papers.length + officialResourceCount, 'README resource-link count does not match the data');
assert(/\[\[paper\]\(https?:\/\//.test(readme) && /\[\[code\]\(https?:\/\//.test(readme) && /\[\[project\]\(https?:\/\//.test(readme), 'README resource labels are incomplete');
assert(guide.includes('p.resources||[]') && guide.includes('paper-resource'), 'Website catalog does not expose verified resources');
assert(!/^- (?:\*\*\d{4}\*\* · )?\[[^\]]+\]\(https?:\/\//m.test(readme), 'README paper titles should not be hyperlinks');
console.log('Catalog checks passed: records, metadata, categories, filters, search, sort, URLs, README synchronization, and escaping.');
