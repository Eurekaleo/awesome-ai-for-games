import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPOSITORY = process.env.STAR_HISTORY_REPOSITORY || 'Eurekaleo/awesome-ai-for-games';
const START_ISO = process.env.STAR_HISTORY_START || '2026-09-15T00:00:00Z';
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const API_ROOT = process.env.GITHUB_API_URL || 'https://api.github.com';

const escapeXml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

async function fetchStargazers() {
  const records = [];
  for (let page = 1; ; page += 1) {
    const response = await fetch(`${API_ROOT}/repos/${REPOSITORY}/stargazers?per_page=100&page=${page}`, {
      headers: {
        Accept: 'application/vnd.github.star+json',
        'User-Agent': 'awesome-ai-for-games-star-history',
        ...(TOKEN ? {Authorization: `Bearer ${TOKEN}`} : {}),
      },
    });
    if (!response.ok) throw new Error(`GitHub stargazers request failed: ${response.status} ${response.statusText}`);
    const batch = await response.json();
    records.push(...batch);
    if (batch.length < 100) break;
  }
  return records;
}

function niceMaximum(value) {
  if (value <= 4) return 4;
  const roughStep = value / 4;
  const power = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / power;
  const step = (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * power;
  return Math.ceil(value / step) * step;
}

function formatDate(timestamp, includeTime) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    ...(includeTime ? {hour: '2-digit', minute: '2-digit', hourCycle: 'h23'} : {}),
  }).format(new Date(timestamp));
}

function renderSvg(records, theme) {
  const start = Date.parse(START_ISO);
  const timestamps = records
    .map((record) => Date.parse(record.starred_at))
    .filter((timestamp) => Number.isFinite(timestamp) && timestamp >= start)
    .sort((a, b) => a - b);
  const minimumSpan = 6 * 60 * 60 * 1000;
  const end = Math.max(timestamps.at(-1) || start, start + minimumSpan);
  const total = timestamps.length;
  const yMax = niceMaximum(total);
  const width = 900;
  const height = 430;
  const plot = {left: 76, top: 158, right: 854, bottom: 332};
  const plotWidth = plot.right - plot.left;
  const plotHeight = plot.bottom - plot.top;
  const x = (timestamp) => plot.left + ((timestamp - start) / Math.max(1, end - start)) * plotWidth;
  const y = (value) => plot.bottom - (value / yMax) * plotHeight;
  const points = [[start, 0], ...timestamps.map((timestamp, index) => [timestamp, index + 1])];
  const linePath = points.map(([timestamp, value], index) => `${index ? 'L' : 'M'} ${x(timestamp).toFixed(2)} ${y(value).toFixed(2)}`).join(' ');
  const areaPath = `${linePath} L ${x(points.at(-1)[0]).toFixed(2)} ${plot.bottom} L ${plot.left} ${plot.bottom} Z`;
  const span = end - start;
  const includeTime = span <= 3 * 24 * 60 * 60 * 1000;
  const xTicks = Array.from({length: 5}, (_, index) => start + (span * index) / 4);
  const yTicks = Array.from({length: 5}, (_, index) => (yMax * index) / 4);
  const isDark = theme === 'dark';
  const palette = isDark ? {
    background: '#0b1220', panel: '#111b2c', border: '#26364d', grid: '#2a3a50',
    primary: '#f8fafc', secondary: '#9fb0c6', muted: '#72839a', accent: '#ff983f', cyan: '#2dd4bf',
  } : {
    background: '#f8fafc', panel: '#ffffff', border: '#dbe4ee', grid: '#e5ebf2',
    primary: '#152238', secondary: '#52637a', muted: '#7b8ca2', accent: '#f47f2c', cyan: '#0ea5a8',
  };
  const gridLines = yTicks.map((value) => `
    <line x1="${plot.left}" y1="${y(value)}" x2="${plot.right}" y2="${y(value)}" stroke="${palette.grid}" stroke-width="1" stroke-dasharray="4 7"/>
    <text x="${plot.left - 18}" y="${y(value) + 5}" text-anchor="end" class="axis">${Math.round(value)}</text>`).join('');
  const xLabels = xTicks.map((timestamp, index) => `
    <text x="${x(timestamp)}" y="${plot.bottom + 31}" text-anchor="${index === 0 ? 'start' : index === 4 ? 'end' : 'middle'}" class="axis">${escapeXml(formatDate(timestamp, includeTime))}</text>`).join('');
  const lastX = x(points.at(-1)[0]);
  const lastY = y(points.at(-1)[1]);
  const startLabel = new Intl.DateTimeFormat('en-GB', {timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric'}).format(new Date(start));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
  <title id="title">Star history for ${escapeXml(REPOSITORY)} since ${escapeXml(startLabel)}</title>
  <desc id="description">${total} stars recorded since ${escapeXml(startLabel)}, shown as a cumulative timeline.</desc>
  <defs>
    <linearGradient id="line" x1="0" x2="1"><stop offset="0" stop-color="${palette.accent}"/><stop offset="1" stop-color="${palette.cyan}"/></linearGradient>
    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${palette.cyan}" stop-opacity=".28"/><stop offset="1" stop-color="${palette.cyan}" stop-opacity=".02"/></linearGradient>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <style>
    text{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;fill:${palette.primary}}
    .eyebrow{font-size:13px;font-weight:750;letter-spacing:2.3px;fill:${palette.accent}}
    .title{font-size:30px;font-weight:760;letter-spacing:-.7px}
    .subtitle{font-size:15px;font-weight:500;fill:${palette.secondary}}
    .metric{font-size:35px;font-weight:780;letter-spacing:-1px}
    .metric-label{font-size:13px;font-weight:700;letter-spacing:1.4px;fill:${palette.secondary}}
    .axis{font-size:12px;font-weight:560;fill:${palette.muted}}
    .footer{font-size:12px;font-weight:620;letter-spacing:.4px;fill:${palette.secondary}}
  </style>
  <rect width="900" height="430" rx="24" fill="${palette.background}"/>
  <circle cx="820" cy="18" r="130" fill="${palette.cyan}" opacity=".055"/>
  <circle cx="52" cy="410" r="110" fill="${palette.accent}" opacity=".045"/>
  <rect x="28" y="28" width="844" height="374" rx="19" fill="${palette.panel}" stroke="${palette.border}"/>
  <circle cx="60" cy="66" r="15" fill="${palette.accent}" opacity=".16"/>
  <path d="M60 55.5l3.3 6.7 7.4 1.1-5.4 5.2 1.3 7.4-6.6-3.5-6.6 3.5 1.3-7.4-5.4-5.2 7.4-1.1z" fill="${palette.accent}"/>
  <text x="88" y="61" class="eyebrow">COMMUNITY MOMENTUM</text>
  <text x="88" y="96" class="title">Star History</text>
  <text x="88" y="122" class="subtitle">Cumulative stars since ${escapeXml(startLabel)} · UTC</text>
  <text x="817" y="78" text-anchor="end" class="metric">+${total}</text>
  <text x="817" y="103" text-anchor="end" class="metric-label">STARS SINCE 15 SEP</text>
  ${gridLines}
  ${xLabels}
  <path d="${areaPath}" fill="url(#area)"/>
  <path d="${linePath}" fill="none" stroke="url(#line)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="${lastX}" cy="${lastY}" r="7" fill="${palette.panel}" stroke="${palette.cyan}" stroke-width="4" filter="url(#glow)"/>
  <text x="76" y="389" class="footer">${escapeXml(REPOSITORY)}</text>
</svg>`;
}

const records = await fetchStargazers();
const outputDir = resolve(ROOT, 'assets/readme');
await mkdir(outputDir, {recursive: true});
await Promise.all([
  writeFile(resolve(outputDir, 'star-history-light.svg'), renderSvg(records, 'light')),
  writeFile(resolve(outputDir, 'star-history-dark.svg'), renderSvg(records, 'dark')),
]);
console.log(`Star history rendered from ${START_ISO}: ${records.filter((record) => Date.parse(record.starred_at) >= Date.parse(START_ISO)).length} stars.`);
