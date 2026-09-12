import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const readmePath = path.join(root, 'README.md');
const referencesPath = path.join(root, 'data/references.json');

const collections = [
  {
    key: 'play',
    title: 'Play and Act',
    focus: 'Policies, planners, generalist agents, embodied control, cooperation, and situated action.',
  },
  {
    key: 'model',
    title: 'Model Games and Players',
    focus: 'World models, learned simulators, state representations, dynamics prediction, and player modeling.',
  },
  {
    key: 'design',
    title: 'Design',
    focus: 'Assets, levels, worlds, rules, mechanics, narratives, procedural generation, and co-creative tools.',
  },
  {
    key: 'build',
    title: 'Build and Maintain',
    focus: 'Code, scenes, engine projects, development agents, debugging, repair, revision, and maintenance.',
  },
  {
    key: 'runtime',
    title: 'Generate and Adapt at Runtime',
    focus: 'Characters, dialogue, quests, narratives, personalization, mechanics, and content generated during play.',
  },
  {
    key: 'test',
    title: 'Test and Evaluate',
    focus: 'Automated playtesting, verification, model judges, behavioral coverage, and player-grounded evidence.',
  },
  {
    key: 'context',
    title: 'Foundations and Context',
    focus: 'Foundational methods, historical context, adjacent surveys, and supporting technical references.',
  },
];

const oldReadme = await readFile(readmePath, 'utf8').catch(() => '');
const featuredTitles = new Set(
  [...oldReadme.matchAll(/^- ⭐ \[([^\]]+)\]\(/gm)].map(([, title]) => title.replaceAll('\\[', '[').replaceAll('\\]', ']')),
);
const {papers, sourceCounts} = JSON.parse(await readFile(referencesPath, 'utf8'));

const escapeMarkdown = value => String(value ?? '')
  .replaceAll('\\', '\\\\')
  .replaceAll('[', '\\[')
  .replaceAll(']', '\\]');

const venueLabel = value => {
  const venue = String(value ?? '').trim();
  if (!venue) return 'Publication';
  if (/^arXiv preprint/i.test(venue)) return 'arXiv';
  return venue.replaceAll('*', '\\*');
};

const anchorFor = title => title
  .toLowerCase()
  .replaceAll('&', '')
  .replace(/[^a-z0-9\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-');

const monthOrder = month => {
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  return months.findIndex(item => String(month ?? '').toLowerCase().startsWith(item));
};

const sorted = [...papers].sort((a, b) =>
  Number(b.year) - Number(a.year)
  || monthOrder(b.month) - monthOrder(a.month)
  || a.title.localeCompare(b.title),
);
const counts = Object.fromEntries(collections.map(({key}) => [key, sorted.filter(paper => paper.primaryRole === key).length]));
const coreCount = sorted.length - counts.context;

const lines = [
  '<div align="center">',
  '  <a href="https://eurekaleo.github.io/awesome-ai-for-games/"><img src="assets/project-logo.png" width="112" alt="AI for Games project logo"></a>',
  '  <h1>Awesome AI for Games</h1>',
  '  <p><strong>A curated, browsable collection of research on AI and foundation models for games.</strong></p>',
  '  <p>Play and act · model games and players · design · build and maintain · generate and adapt at runtime · test and evaluate</p>',
  '',
  '  <a href="https://awesome.re"><img src="https://awesome.re/badge-flat2.svg" alt="Awesome"></a>',
  `  <a href="https://eurekaleo.github.io/awesome-ai-for-games/#papers"><img src="https://img.shields.io/badge/references-${sorted.length}-168f91?style=flat-square" alt="${sorted.length} references"></a>`,
  `  <img src="https://img.shields.io/badge/core%20works-${coreCount}-c78b1e?style=flat-square" alt="${coreCount} core works">`,
  '  <a href="https://eurekaleo.github.io/awesome-ai-for-games/"><img src="https://img.shields.io/badge/project-website-6f63d9?style=flat-square" alt="Project website"></a>',
  '  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-475569?style=flat-square" alt="MIT license"></a>',
  '</div>',
  '',
  '---',
  '',
  '## About',
  '',
  'This repository is the public literature index for research in which AI directly participates in how interactive games are played, modeled, designed, built, adapted, or tested. It connects historical foundations with recent language-model, multimodal, world-model, code-agent, and tool-using systems.',
  '',
  '**[Explore the project website →](https://eurekaleo.github.io/awesome-ai-for-games/)**',
  '',
  'The collection accompanies the survey **AI for Games in the Foundation Model Era**. The manuscript PDF is intentionally not distributed in this repository.',
  `The living index currently combines **${sourceCounts.manuscript} manuscript references** with **${sourceCounts.livingAdditions} later public additions**.`,
  '',
  '> Each entry appears once under its primary research role. Cross-role relationships, visual examples, and searchable filters are available on the project website.',
  '',
  '## Contents',
  '',
  ...collections.map(({key, title}) => `- [${title}](#${anchorFor(title)}) (${counts[key]})`),
  '- [Contributing](#contributing)',
  '',
  '## Collections',
  '',
  '| Collection | Focus | Works |',
  '| --- | --- | ---: |',
  ...collections.map(({key, title, focus}) => `| **[${title}](#${anchorFor(title)})** | ${focus} | ${counts[key]} |`),
  '',
  `The six core roles contain **${coreCount} works**; **${counts.context} supporting references** are listed separately as foundations and context. Entries are ordered newest first. ⭐ marks a foundational or widely used reference selected in the catalog.`,
];

for (const collection of collections) {
  lines.push('', `## ${collection.title}`, '', `> ${collection.focus}`);
  const entries = sorted.filter(paper => paper.primaryRole === collection.key);
  let currentYear;
  for (const paper of entries) {
    if (paper.year !== currentYear) {
      currentYear = paper.year;
      lines.push('', `### ${currentYear}`, '');
    }
    const star = featuredTitles.has(paper.title) ? '⭐ ' : '';
    lines.push(`- ${star}[${escapeMarkdown(paper.title)}](${paper.url}) — *${venueLabel(paper.venue)}*.`);
  }
}

lines.push(
  '',
  '## Contributing',
  '',
  'Paper suggestions and corrections are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and use the [paper-suggestion form](https://github.com/Eurekaleo/awesome-ai-for-games/issues/new/choose).',
  '',
  '## License',
  '',
  'Repository code and original interface assets are released under the [MIT License](LICENSE). Linked papers, project media, and third-party resources remain subject to their original licenses and terms.',
  '',
);

await writeFile(readmePath, lines.join('\n'));
console.log(`README rendered: ${sorted.length} references across ${collections.length} collections.`);
