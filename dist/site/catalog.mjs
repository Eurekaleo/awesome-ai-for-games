export const ROLES = {
  play: 'Play & Act', model: 'Model Games & Players', design: 'Design',
  build: 'Build & Maintain', runtime: 'Generate & Adapt at Runtime', test: 'Test & Evaluate',
};
export const FILTER_LABELS = {...ROLES, context: 'Foundations & context'};
export function searchPapers(papers, {query = '', role = '', year = ''} = {}) {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return papers.filter(p => (!role || p.primaryRole === role) && (!year || String(p.year) === String(year)) &&
    terms.every(term => [p.title, p.authors, p.venue, p.url, p.aliases?.join(' '), ...(p.topics || [])].join(' ').replaceAll('-', ' ').toLocaleLowerCase().includes(term.replaceAll('-', ' '))));
}
export function sortPapers(papers) {
  return [...papers].sort((a,b) => Number(b.year)-Number(a.year) || Number(b.month || 0)-Number(a.month || 0) || a.title.localeCompare(b.title));
}
export function safePaperUrl(value) {
  try { const u = new URL(value); return ['http:', 'https:'].includes(u.protocol) ? u.href : null; } catch { return null; }
}
export function escapeHtml(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
