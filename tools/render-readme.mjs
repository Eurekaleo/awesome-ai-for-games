import {mkdir, readdir, readFile, unlink, writeFile} from 'node:fs/promises';
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
    cardTitle: ['Play and Act'],
    accent: '#72afe0',
    icon: 'M8 5 19 12 8 19Z',
    groupBefore: 2017,
  },
  {
    key: 'model',
    title: 'Model Players and Games',
    focus: 'Player modeling, world models, learned simulators, state representations, and dynamics prediction.',
    cardTitle: ['Model Players', 'and Games'],
    accent: '#89c668',
    icon: 'm12 3 9 5v8l-9 5-9-5V8Zm0 10 9-5m-9 5L3 8m9 5v8',
    groupBefore: 2020,
  },
  {
    key: 'design',
    title: 'Design',
    focus: 'Assets, levels, worlds, rules, mechanics, narratives, procedural generation, and co-creative tools.',
    cardTitle: ['Design'],
    accent: '#9692e5',
    icon: 'm4 16 12-12 4 4L8 20H4Zm9-9 4 4',
    groupBefore: 2023,
  },
  {
    key: 'build',
    title: 'Build and Maintain',
    focus: 'Code, scenes, engine projects, development agents, debugging, repair, revision, and maintenance.',
    cardTitle: ['Build and', 'Maintain'],
    accent: '#e48748',
    icon: 'm8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18',
  },
  {
    key: 'runtime',
    title: 'Generate and Adapt at Runtime',
    focus: 'Characters, dialogue, quests, narratives, personalization, mechanics, and content generated during play.',
    cardTitle: ['Generate and Adapt', 'at Runtime'],
    accent: '#46d7d7',
    icon: 'M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-1 1v-9.5A8.5 8.5 0 0 1 11.5 3H13m4 0v7m-3.5-3.5h7M7 12h8m-8 4h5',
    groupBefore: 2023,
  },
  {
    key: 'test',
    title: 'Test and Evaluate',
    focus: 'Automated playtesting, verification, model judges, behavioral coverage, and player-grounded evidence.',
    cardTitle: ['Test and Evaluate'],
    accent: '#d2ad39',
    icon: 'm4 12 5 5L20 6M5 3H3v18h18v-2',
    groupBefore: 2020,
  },
  {
    key: 'context',
    title: 'Foundations and Context',
    focus: 'Foundational methods, historical context, adjacent surveys, and supporting technical references.',
    groupBefore: 2024,
  },
];

const {papers} = JSON.parse(await readFile(referencesPath, 'utf8'));

const escapeMarkdown = value => String(value ?? '')
  .replaceAll('\\', '\\\\')
  .replaceAll('[', '\\[')
  .replaceAll(']', '\\]');

const venueLabel = value => {
  const venue = String(value ?? '').trim();
  if (!venue) return 'Source not specified';
  if (/^arXiv|^CoRR$/i.test(venue)) return 'arXiv';
  if (/Accepted to EMNLP/i.test(venue)) return 'EMNLP (accepted)';
  if (/Findings of .*NAACL/i.test(venue)) return 'Findings of NAACL';
  if (/Findings of .*ACL/i.test(venue)) return 'Findings of ACL';
  if (/EMNLP-IJCNLP/i.test(venue)) return 'EMNLP–IJCNLP';
  if (/Empirical Methods in Natural Language Processing/i.test(venue)) return 'EMNLP';
  if (/Annual Meeting of the Association for Computational Linguistics/i.test(venue)) return 'ACL';
  if (/Artificial Intelligence and Interactive Digital Entertainment|\bAIIDE\b/i.test(venue)) return 'AIIDE';
  if (/Neural Information Processing Systems.*Datasets and Benchmarks/i.test(venue)) return 'NeurIPS D&B';
  if (/NeurIPS.*Competitions and Demonstrations/i.test(venue)) return 'NeurIPS C&D';
  if (/Neural Information Processing Systems/i.test(venue)) return 'NeurIPS';
  if (/Learning Representations/i.test(venue)) return 'ICLR';
  if (/Machine Learning/i.test(venue) && /Conference/i.test(venue)) return 'ICML';
  if (/Computer Vision and Pattern Recognition/i.test(venue)) return 'CVPR';
  if (/International Conference on Computer Vision/i.test(venue)) return 'ICCV';
  if (/Extended Abstracts.*CHI Conference/i.test(venue)) return 'CHI EA';
  if (/(?:Human-Computer|Computer-Human) Interaction in Play/i.test(venue)) return 'CHI PLAY';
  if (/CHI Conference on Human Factors|SIGCHI Conference on Human Factors/i.test(venue)) return 'CHI';
  if (/Foundations of Digital Games|\bFDG\b/i.test(venue)) return 'FDG';
  if (/Digital Games Research Association|\bDiGRA\b/i.test(venue)) return 'DiGRA';
  if (/Conversational User Interfaces/i.test(venue)) return 'ACM CUI';
  if (/World Wide Web Companion/i.test(venue)) return 'WWW Companion';
  if (/Wordplay: When Language Meets Games/i.test(venue)) return 'Wordplay Workshop';
  if (/Foundations of Software Engineering/i.test(venue)) return 'ACM FSE Companion';
  if (/Data Science and Advanced Analytics/i.test(venue)) return 'IEEE DSAA';
  if (/Advances in Computer Entertainment Technology/i.test(venue)) return 'ACE';
  if (/Canadian Conference on Artificial Intelligence/i.test(venue)) return 'Canadian AI';
  if (/Computing Frontiers Conference/i.test(venue)) return 'Computing Frontiers';
  if (/IEEE Conference on (?:Computational Intelligence (?:and|in) Games|Games)/i.test(venue)) return /\bCIG\b/i.test(venue) ? 'IEEE CIG' : 'IEEE CoG';
  if (/^Artificial and Computational Intelligence in Games$/i.test(venue)) return 'Book chapter';
  if (/Genetic and Evolutionary Computation/i.test(venue)) return 'GECCO';
  if (/AAAI Conference on Artificial Intelligence|Twenty-Fifth International Joint Conference on Artificial Intelligence/i.test(venue)) return /Joint Conference/i.test(venue) ? 'IJCAI' : 'AAAI';
  if (/User Interface Software and Technology/i.test(venue)) return 'UIST';
  if (/Automated Software Engineering/i.test(venue)) return 'ASE';
  if (/Automation of Software Test/i.test(venue)) return 'AST';
  if (/Games and Software Engineering/i.test(venue)) return 'Games & SE';
  if (/Intelligent Robots and Systems/i.test(venue)) return 'IROS';
  if (/Evolutionary Computation.*EvoApplications|Applications of Evolutionary Computation/i.test(venue)) return 'EvoApplications';
  if (/ACM Computing Surveys/i.test(venue)) return 'ACM CSUR';
  if (/ACM Transactions on Computer-Human Interaction/i.test(venue)) return 'ACM TOCHI';
  if (/Proceedings of the ACM on Human-Computer Interaction/i.test(venue)) return 'PACM HCI';
  if (/ACM Transactions on Multimedia/i.test(venue)) return 'ACM TOMM';
  if (/Transactions on Machine Learning Research/i.test(venue)) return 'TMLR';
  if (/IEEE Transactions on Computational Intelligence and AI in Games/i.test(venue)) return 'IEEE T-CIAIG';
  if (/IEEE Transactions on Games/i.test(venue)) return 'IEEE ToG';
  if (/IEEE Transactions on Pattern Analysis and Machine Intelligence/i.test(venue)) return 'IEEE TPAMI';
  if (/IEEE Transactions on Affective Computing/i.test(venue)) return 'IEEE TAC';
  if (/IEEE Transactions on Systems, Man, and Cybernetics/i.test(venue)) return 'IEEE TSMC-A';
  if (/Journal of Artificial Intelligence Research/i.test(venue)) return 'JAIR';
  if (/IBM Journal of Research and Development/i.test(venue)) return 'IBM JRD';
  if (/Communications of the ACM/i.test(venue)) return 'CACM';
  if (/Software Testing, Verification and Reliability/i.test(venue)) return 'STVR';
  if (/International Journal of Human-Computer Interaction/i.test(venue)) return 'IJHCI';
  if (/Advances in Human-Computer Interaction/i.test(venue)) return 'Advances in HCI';
  if (/Machine Learning and Knowledge Extraction/i.test(venue)) return 'ML & Knowledge Extraction';
  if (/Machine Learning: ECML/i.test(venue)) return 'ECML';
  if (/Artificial Intelligence and Human-Oriented Computing/i.test(venue)) return 'AI/Human-Oriented Computing';
  if (/London, Edinburgh, and Dublin Philosophical Magazine/i.test(venue)) return 'Philosophical Magazine';
  if (/Multimedia Tools and Applications/i.test(venue)) return 'Multimedia Tools & Apps';
  if (/Proceedings of the IEEE/i.test(venue)) return 'Proceedings of the IEEE';
  if (/Official benchmark results/i.test(venue)) return 'Official results';
  if (/Official project repository/i.test(venue)) return 'Project repository';
  if (/Official technology demonstration|Official technical report and demonstration/i.test(venue)) return 'Official demo';
  if (/Official game store page/i.test(venue)) return 'Game store';
  if (/Google DeepMind technical announcement/i.test(venue)) return 'DeepMind announcement';
  if (/OpenAI customer case study/i.test(venue)) return 'OpenAI case study';
  if (/NVIDIA Technical Blog/i.test(venue)) return 'NVIDIA blog';
  if (/Roblox Engineering/i.test(venue)) return 'Roblox Engineering';
  if (/Official Gran Turismo news/i.test(venue)) return 'Gran Turismo news';
  if (/Project or technical resource/i.test(venue)) return 'Project resource';
  if (/Proceedings of the /i.test(venue)) return venue.replace(/^Proceedings of the /i, '');
  return venue;
};

const sourceType = paper => {
  const venue = String(paper.venue ?? '');
  const label = venueLabel(venue);
  if (/^arXiv|^CoRR$/i.test(venue)) return 'preprint';
  if (/^Official|technical announcement|Technical Blog|customer case study|Developer documentation|Project or technical resource|Ubisoft News|Unity Blog|Roblox Engineering/i.test(venue)) return 'industry';
  if (/^Proceedings of the (?:IEEE|ACM on Human-Computer Interaction)$/i.test(venue)) return 'journal';
  if (/Conference|Proceedings|Symposium|Workshop|\bAAAI\b|\bICLR\b|\bICML\b|\bCoG\b|\bCIG\b|\bEMNLP\b|\bFDG\b/i.test(venue)
    || /^(?:NeurIPS(?: D&B| C&D)?|Findings of (?:ACL|NAACL)|ACL|CVPR|ICCV|AIIDE|ECML|EvoApplications)$/.test(label)) return 'conference';
  if (paper.kind === 'book' || paper.kind === 'incollection') return 'book';
  if (paper.kind === 'article') return 'journal';
  return 'other';
};

const badgePalette = {
  conference: {fill: '#eaf4f8', stroke: '#b9d9e5', ink: '#28647c'},
  journal: {fill: '#f0edf8', stroke: '#d3c7e9', ink: '#634e8e'},
  preprint: {fill: '#eef1f5', stroke: '#cdd6df', ink: '#536578'},
  industry: {fill: '#fff2df', stroke: '#efd5aa', ink: '#8c5b1d'},
  book: {fill: '#eaf5f0', stroke: '#bedecb', ink: '#386f58'},
  other: {fill: '#f1f3f5', stroke: '#d8dce1', ink: '#5b6772'},
};

const xmlEscape = value => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const slug = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const iconSvg = collection => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36"><rect x="1" y="1" width="34" height="34" rx="9" fill="#182231" stroke="${collection.accent}" stroke-opacity=".68"/><path d="${collection.icon}" transform="translate(6 6)" fill="none" stroke="${collection.accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const roleCardSvg = (collection, index, count) => {
  const first = collection.cardTitle[0];
  const second = collection.cardTitle[1];
  const title = second
    ? `<text x="64" y="30" font-size="14" font-weight="700">${xmlEscape(first)}</text><text x="64" y="47" font-size="14" font-weight="700">${xmlEscape(second)}</text>`
    : `<text x="64" y="38" font-size="15" font-weight="700">${xmlEscape(first)}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 246 70" width="246" height="70" role="img" aria-label="${xmlEscape(collection.title)}, ${count} works"><rect x=".5" y=".5" width="245" height="69" rx="9" fill="#141c29" stroke="#334358"/><path d="M9 1h1v68H9z" fill="${collection.accent}"/><rect x="19" y="18" width="36" height="36" rx="9" fill="#213043"/><path d="${collection.icon}" transform="translate(25 24)" fill="none" stroke="${collection.accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><g fill="#f4f7fb" font-family="Arial,Helvetica,sans-serif">${title}</g><text x="230" y="18" fill="${collection.accent}" font-family="Arial,Helvetica,sans-serif" font-size="10" font-weight="700" text-anchor="end">0${index + 1}</text><text x="230" y="58" fill="#97a7ba" font-family="Arial,Helvetica,sans-serif" font-size="10" text-anchor="end">${count} works</text></svg>`;
};
const venueBadgeSvg = (label, type) => {
  const colors = badgePalette[type];
  const width = Math.max(54, Math.ceil(label.length * 6.35 + 27));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 22" width="${width}" height="22" role="img" aria-label="${xmlEscape(label)}"><rect x=".5" y=".5" width="${width - 1}" height="21" rx="5" fill="${colors.fill}" stroke="${colors.stroke}"/><rect x="1" y="1" width="4" height="20" rx="2" fill="${colors.ink}"/><text x="14" y="15" fill="${colors.ink}" font-family="Arial,Helvetica,sans-serif" font-size="11" font-weight="700">${xmlEscape(label)}</text></svg>`;
};

const anchorFor = title => title
  .toLowerCase()
  .replaceAll('&', '')
  .replace(/[^a-z0-9\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-');

const sorted = [...papers].sort((a, b) =>
  Number(b.year) - Number(a.year)
  || a.title.localeCompare(b.title),
);
const counts = Object.fromEntries(collections.map(({key}) => [key, sorted.filter(paper => paper.primaryRole === key).length]));
const coreCount = sorted.length - counts.context;
const introductionVideoPageUrl = 'https://eurekaleo.github.io/awesome-ai-for-games/#video';
const readmeAssetRoot = path.join(root, 'assets/readme');
const venueAssetRoot = path.join(readmeAssetRoot, 'venues');
await mkdir(venueAssetRoot, {recursive: true});
for (const [index, collection] of collections.entries()) {
  if (!collection.accent) continue;
  await writeFile(path.join(readmeAssetRoot, `role-${collection.key}.svg`), roleCardSvg(collection, index, counts[collection.key]));
  await writeFile(path.join(readmeAssetRoot, `icon-${collection.key}.svg`), iconSvg(collection));
}
const venueAssets = new Map();
for (const paper of sorted) {
  const label = venueLabel(paper.venue);
  const type = sourceType(paper);
  const file = `${type}-${slug(label)}.svg`;
  venueAssets.set(`${type}:${label}`, {file, label, type});
}
for (const {file, label, type} of venueAssets.values()) {
  await writeFile(path.join(venueAssetRoot, file), venueBadgeSvg(label, type));
}
for (const [type, label] of [
  ['conference', 'Conference'], ['journal', 'Journal'], ['preprint', 'Preprint'],
  ['industry', 'Official / industry'], ['book', 'Book'],
]) {
  await writeFile(path.join(readmeAssetRoot, `legend-${type}.svg`), venueBadgeSvg(label, type));
}
const activeVenueFiles = new Set([...venueAssets.values()].map(({file}) => file));
for (const file of await readdir(venueAssetRoot)) {
  if (file.endsWith('.svg') && !activeVenueFiles.has(file)) await unlink(path.join(venueAssetRoot, file));
}

const venueBadge = paper => {
  const label = venueLabel(paper.venue);
  const file = `${sourceType(paper)}-${slug(label)}.svg`;
  return `<img src="assets/readme/venues/${file}" alt="${xmlEscape(label)}" title="${xmlEscape(paper.venue || label)}" height="20">`;
};

const lines = [
  '<div align="center">',
  '  <a href="https://eurekaleo.github.io/awesome-ai-for-games/"><img src="assets/project-logo.png" width="94" alt="AI for Games project logo"></a>',
  '  <h1>Awesome AI for Games</h1>',
  '  <h2><a href="https://arxiv.org/pdf/2609.16679">AI for Games in the Foundation Model Era</a></h2>',
  '  <p>Six research roles · Three recurring questions · One evidence-centered map of the field</p>',
  '',
  '  <a href="https://arxiv.org/pdf/2609.16679"><img src="https://img.shields.io/badge/arXiv-2609.16679-B31B1B?style=flat-square&logo=arxiv&logoColor=white" alt="Read the paper on arXiv"></a>',
  '  <a href="https://eurekaleo.github.io/awesome-ai-for-games/"><img src="https://img.shields.io/badge/explore-project%20website-6f63d9?style=flat-square" alt="Explore the project website"></a>',
  `  <a href="https://eurekaleo.github.io/awesome-ai-for-games/#papers"><img src="https://img.shields.io/badge/references-${sorted.length}-168f91?style=flat-square" alt="${sorted.length} references"></a>`,
  `  <img src="https://img.shields.io/badge/core%20works-${coreCount}-c78b1e?style=flat-square" alt="${coreCount} core works">`,
  '  <a href="https://awesome.re"><img src="https://awesome.re/badge-flat2.svg" alt="Awesome"></a>',
  '',
  '  <p><a href="https://eurekaleo.github.io/">Meng Luo</a><sup>1</sup> · <a href="https://liyanlin06.github.io/">Yanlin Li</a><sup>1</sup> · <a href="https://scholar.google.com/citations?user=vF-UH7oAAAAJ&amp;hl=zh-TW">Hao Li</a><sup>1</sup> · <a href="https://daniellin97.github.io/">Hongzhan Lin</a><sup>1</sup> · <a href="https://lancezpf.github.io/">Pengfei Zhou</a><sup>1</sup> · <a href="https://jometeorie.github.io/">Tianjie Ju</a><sup>1</sup><br><a href="https://openreview.net/profile?id=~Ran_Zhang18">Ran Zhang</a><sup>2</sup> · <a href="https://jinyeying.github.io/">Yeying Jin</a><sup>1</sup> · <a href="https://www.comp.nus.edu.sg/cs/people/leeml/">Mong-Li Lee</a><sup>1</sup> · <a href="https://www.comp.nus.edu.sg/cs/people/whsu/">Wynne Hsu</a><sup>1</sup></p>',
  '  <p><sub><sup>1</sup> National University of Singapore &nbsp;·&nbsp; <sup>2</sup> Nanyang Technological University</sub></p>',
  '</div>',
  '',
  '## 90-second paper overview',
  '',
  `<p align="center"><a href="${introductionVideoPageUrl}"><img src="assets/video/ai-for-games-introduction-poster.webp" width="1000" alt="Watch AI for Games — 90-Second Paper Overview"></a></p>`,
  '',
  `<p align="center"><a href="${introductionVideoPageUrl}"><strong>▶ Watch AI for Games — 90-Second Paper Overview</strong></a></p>`,
  '',
  '## About the survey',
  '',
  'Foundation models now do more than play a given game: they can model games and players, design content and rules, build executable projects, shape live experiences, and support testing. This repository organizes the survey literature into six roles according to how each AI output is used.',
  '',
  '> [!IMPORTANT]',
  '> **Three questions guide the synthesis across every role.** **Boundary:** what is supplied by the game or workflow, and what is assigned to AI? **Transfer and reuse:** which capabilities transfer, which artifacts can be reused, and what remains setting-specific? **Evidence:** what claims does evaluation support where the output is actually used?',
  '',
  '**Explore:** [Visual survey map](https://eurekaleo.github.io/awesome-ai-for-games/#map) · [Literature search](https://eurekaleo.github.io/awesome-ai-for-games/#papers) · [AI-crafted games](https://eurekaleo.github.io/awesome-ai-for-games/#playable-games)',
  '',
  '<p align="center"><a href="https://eurekaleo.github.io/awesome-ai-for-games/"><img src="assets/readme/survey-banner.webp" width="1000" alt="Panoramic AI for Games project banner connecting design, build, modeling, runtime generation, play, and testing"></a></p>',
  '',
  '## Repository guide',
  '',
  '[About the survey](#about-the-survey) · [Choose a research role](#choose-a-research-role) · [Read the index](#reading-the-index) · [Foundations and context](#foundations-and-context) · [Contribute](#contributing)',
  '',
  '## Choose a research role',
  '',
  'Select a role to jump directly to its papers.',
  '',
  '<p align="center">',
  ...collections.filter(collection => collection.accent).flatMap((collection, index) => [
    `  <a href="#${anchorFor(collection.title)}"><img src="assets/readme/role-${collection.key}.svg" width="246" alt="${xmlEscape(collection.title)}: ${counts[collection.key]} works"></a>`,
    ...(index === 2 ? ['  <br>'] : []),
  ]),
  '</p>',
  '',
  '## Reading the index',
  '',
  'Each work appears once under its primary role and carries a source-type badge. Sparse early years are consolidated into a “Before YEAR” group, with the exact year retained beside each title.',
  '',
  '<p><img src="assets/readme/legend-conference.svg" alt="Conference source" height="20"> <img src="assets/readme/legend-journal.svg" alt="Journal source" height="20"> <img src="assets/readme/legend-preprint.svg" alt="Preprint source" height="20"> <img src="assets/readme/legend-industry.svg" alt="Official or industry source" height="20"> <img src="assets/readme/legend-book.svg" alt="Book source" height="20"></p>',
];

for (const collection of collections) {
  const roleIcon = collection.accent ? `<img src="assets/readme/icon-${collection.key}.svg" alt="" width="24" height="24"> ` : '';
  lines.push('', '---', '', `## ${collection.title}`, '', `${roleIcon}${collection.focus}`);
  const entries = sorted.filter(paper => paper.primaryRole === collection.key);
  let currentGroup;
  for (const paper of entries) {
    const isEarly = Boolean(collection.groupBefore) && Number(paper.year) < collection.groupBefore;
    const group = isEarly ? `before-${collection.groupBefore}` : paper.year;
    if (group !== currentGroup) {
      currentGroup = group;
      const groupLabel = isEarly ? `Before ${collection.groupBefore}` : paper.year;
      lines.push('', `### ${groupLabel}`, '');
    }
    const yearPrefix = isEarly ? `**${paper.year}** · ` : '';
    lines.push(`- ${yearPrefix}[${escapeMarkdown(paper.title)}](${paper.url})&nbsp;${venueBadge(paper)}`);
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
