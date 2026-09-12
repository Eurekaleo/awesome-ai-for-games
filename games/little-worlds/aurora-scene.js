const SVG_NS = 'http://www.w3.org/2000/svg';
const pointKey = (point) => `${point[0]},${point[1]}`;

export class AuroraScene {
  constructor(container, onCell) {
    this.container = container; this.onCell = onCell;
    this.svg = document.createElementNS(SVG_NS, 'svg'); this.svg.classList.add('tactical-map');
    this.svg.setAttribute('role', 'img'); this.svg.setAttribute('aria-label', 'Aurora Outpost tactical map with a robot, beacons, an exit, and orange storm forecasts on a square grid');
    this.svg.setAttribute('viewBox', '0 0 820 680'); this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    this.svg.addEventListener('click', (event) => { const cell = event.target.closest('[data-cell]'); if (cell && this.onCell) this.onCell([Number(cell.dataset.x), Number(cell.dataset.y)]); });
    container.appendChild(this.svg); this.level = null; this.state = null; this.draws = 0; this.lastAction = null; this.effectTimer = null;
  }
  loadLevel(level, state) { this.level = level; this.update(state); }
  glyph(type, x, y, options = {}) {
    if (type === 'beacon') return `<g transform="translate(${x} ${y})" class="map-decor"><circle r="26" fill="${options.active ? '#b5e9cc0b' : '#88ada707'}" stroke="${options.active ? '#b7e8ce' : '#8cbbb5'}" stroke-width="1" stroke-opacity="${options.active ? '.4' : '.18'}"/><circle r="17" fill="none" stroke="${options.active ? '#b7e8ce' : '#9ec7bf'}" stroke-width="1.5" stroke-dasharray="${options.active ? '' : '4 4'}" class="${options.active ? 'beacon-ready' : ''}"/><path d="m0-11 8 14H-8Z" fill="${options.active ? '#b7e8ce' : '#456c79'}" stroke="${options.active ? '#d1f0dc' : '#aed8cd'}" stroke-width="1.2"/><circle cy="-6" r="2.7" fill="${options.active ? '#f0f2d2' : '#b7dcd0'}"/><text x="20" y="-20" class="beacon-label">${String(options.index + 1).padStart(2, '0')}</text>${options.active ? '<path d="m-5 8 4 4 7-8" fill="none" stroke="#a4e2bf" stroke-width="1.4"/>' : ''}</g>`;
    if (type === 'battery') return `<g transform="translate(${x} ${y})" class="map-decor"><circle r="18" fill="#e8c79509"/><rect x="-10" y="-14" width="20" height="27" rx="4" fill="#3b5260" stroke="#e8ca92" stroke-width="1.4"/><path d="M-3-17h6" stroke="#e8ca92" stroke-width="2.6"/><path d="m1-9-7 11h5l-1 7 8-11H1Z" fill="#e8ca92"/></g>`;
    if (type === 'exit') return `<g transform="translate(${x} ${y})" class="map-decor"><path d="m0-27 27 27-27 27-27-27Z" fill="#7fc2b70b" stroke="${options.ready ? '#b2e6cb' : '#779fa9'}" stroke-width="1.2" stroke-dasharray="${options.ready ? '' : '3 4'}"/><path d="M-12 12V-9l12-8 12 8v21Z" fill="#395668" stroke="${options.ready ? '#caeedb' : '#9fbdc5'}" stroke-width="1.3"/><path d="M-5 12V-1H5v13" fill="${options.ready ? '#a0d3b5' : '#789eac'}"/><path d="M-16 17h32" stroke="#b6cfc7" stroke-width="1.4"/></g>`;
    return '';
  }
  update(state, previous = null, action = null) {
    this.state = state; this.lastAction = action;
    const level = this.level; const cell = Math.min(77, 590 / level.height, 690 / level.width);
    const ox = (820 - level.width * cell) / 2; const oy = (680 - level.height * cell) / 2 + 2;
    this.layout = { cell, ox, oy };
    const center = (p) => [ox + (p[0] + 0.5) * cell, oy + (p[1] + 0.5) * cell];
    const wallSet = new Set(level.walls.map(pointKey)); const warnedSet = new Set(state.warning.map(pointKey));
    const parts = [`<defs><pattern id="storm-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="3" height="10" fill="#e49c7e" opacity=".22"/></pattern><pattern id="map-grid" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r=".65" fill="#a2c2c4" opacity=".07"/></pattern><filter id="soft-beacon"><feGaussianBlur stdDeviation="7"/></filter></defs>`];
    parts.push('<rect x="38" y="48" width="744" height="584" rx="8" fill="url(#map-grid)" class="map-decor"/>');
    parts.push(`<path d="M${ox - 13} ${oy + 12}v-25h25m${level.width * cell - 24} 0h25v25M${ox - 13} ${oy + level.height * cell - 12}v25h25m${level.width * cell - 24} 0h25v-25" fill="none" stroke="#95b9bf" stroke-opacity=".23" stroke-width="1" class="map-decor"/>`);
    for (let x = 0; x < level.width; x++) parts.push(`<text x="${ox + (x + 0.5) * cell}" y="${oy - 23}" text-anchor="middle" class="coordinate-label">${String.fromCharCode(65 + x)}</text>`);
    for (let y = 0; y < level.height; y++) parts.push(`<text x="${ox - 25}" y="${oy + (y + 0.5) * cell + 3}" text-anchor="middle" class="coordinate-label">${String(y + 1).padStart(2, '0')}</text>`);
    for (let y = 0; y < level.height; y++) for (let x = 0; x < level.width; x++) {
      const px = ox + x * cell; const py = oy + y * cell; const key = `${x},${y}`; const isWall = wallSet.has(key);
      const warned = warnedSet.has(key);
      parts.push(`<g data-cell="${key}" data-x="${x}" data-y="${y}"><rect class="map-cell" x="${px + 2}" y="${py + 2}" width="${cell - 4}" height="${cell - 4}" rx="5" fill="${isWall ? '#35506335' : '#789ba610'}" stroke="#81a7b1" stroke-opacity="${isWall ? '.04' : '.16'}" stroke-width=".8"/>`);
      if (isWall) {
        const variation = (x * 17 + y * 31) % 4; const s = cell / 77; const [cx, cy] = center([x, y]);
        parts.push(`<g transform="translate(${cx} ${cy}) scale(${s})" pointer-events="none"><path d="M-25 15-28-10-13-25 13-24 29-7 22 21 0 27Z" fill="${['#425c6c', '#3c5668', '#405b6b', '#3b5665'][variation]}" stroke="#92afba" stroke-width=".7" stroke-opacity=".18"/><path d="m-28-10 27 7 14-21M-1-3 22 21M-1-3-13-25" fill="none" stroke="#aac1c8" stroke-opacity=".14" stroke-width=".7"/><path d="m-28-10 15-15 26 1-14 21Z" fill="#b4ced009"/>${variation === 0 ? '<path d="m-18 9 8 7 12-3" stroke="#b4ced0" stroke-opacity=".13" fill="none"/>' : ''}</g>`);
      }
      if (warned) parts.push(`<rect class="storm-hatch" x="${px + 3}" y="${py + 3}" width="${cell - 6}" height="${cell - 6}" rx="4" fill="url(#storm-hatch)" pointer-events="none"/><rect class="storm-cell" x="${px + 3}" y="${py + 3}" width="${cell - 6}" height="${cell - 6}" rx="4" fill="none" stroke="#e69b7b" stroke-opacity=".7" stroke-width="1.2" stroke-dasharray="3 3" pointer-events="none"/><path d="m${px + cell - 13} ${py + 8} 5 9H${px + cell - 18}Z" fill="#e8ad8a" opacity=".7" pointer-events="none"/>`);
      parts.push('</g>');
    }
    const exitPoint = center(level.exit); parts.push(this.glyph('exit', ...exitPoint, { ready: state.activated.length === level.beacons.length }));
    level.batteries.forEach((point, index) => { if (!state.collected.includes(index)) parts.push(this.glyph('battery', ...center(point))); });
    level.beacons.forEach((point, index) => parts.push(this.glyph('beacon', ...center(point), { active: state.activated.includes(index), index })));
    const [px, py] = center(state.player);
    const damaged = previous && state.hp < previous.hp;
    const shielded = action?.type === 'shield' && previous && state.turn > previous.turn;
    const face = state.lost ? '#b3927f' : '#dceae3';
    parts.push(`<g transform="translate(${px} ${py})" class="map-decor">${shielded ? '<circle class="shield-ring" r="33" stroke="#bbdfdc" fill="#b2dace08" stroke-width="1.6"/><path class="shield-outline" d="m-26-21 26-13 26 13v28L0 34-26 7Z" fill="none" stroke="#9cd7d1" stroke-opacity=".4" stroke-width="1"/>' : ''}<ellipse cx="0" cy="22" rx="22" ry="8" fill="#0f223757"/><g class="robot-shell"><path d="M-16-6v18m32-18v18" stroke="${face}" stroke-width="5" stroke-linecap="round"/><path d="M-8 14v8m16-8v8" stroke="${face}" stroke-width="5" stroke-linecap="round"/><path d="M0-19v-9" stroke="${face}" stroke-width="2.2"/><circle cy="-29" r="3.1" fill="${damaged ? '#e49372' : '#edd197'}"/><rect x="-14" y="-20" width="28" height="36" rx="9" fill="${face}"/><rect x="-11" y="-14" width="22" height="13" rx="4.5" fill="#35586b"/><path d="M-6-8h3m6 0h3" stroke="${damaged ? '#e6a283' : '#b5e8d2'}" stroke-width="2.8" stroke-linecap="round"/><rect x="-5" y="5" width="10" height="5" rx="1" fill="#88afa4"/><path d="M-8-18h16" stroke="#f7faf3" stroke-opacity=".55" stroke-width="1.2"/></g>${damaged ? '<path d="m-24-17-5-6m54 2 6-6M-30 5h-7m61 6 7 4" stroke="#e7a184" stroke-width="2" stroke-linecap="round"/>' : ''}</g>`);
    const labelY = oy + level.height * cell + 34;
    parts.push(`<text x="${ox + 4}" y="${labelY}" fill="#87a5b4" font-size="8" letter-spacing="1.4" font-family="monospace" class="map-decor">${level.id.toUpperCase()} / ARCTIC FIELD MAP</text><text x="${ox + level.width * cell - 4}" y="${labelY}" text-anchor="end" class="storm-text map-decor">${state.won ? 'ALL BEACONS ONLINE' : state.lost ? 'SIGNAL LOST' : 'NEXT ACTION → STORM'}</text>`);
    this.svg.innerHTML = parts.join(''); this.draws++;
    clearTimeout(this.effectTimer);
    if (shielded) this.effectTimer = setTimeout(() => this.svg.querySelectorAll('.shield-ring,.shield-outline').forEach((node) => node.remove()), 850);
  }
  project(point) {
    const { cell, ox, oy } = this.layout; const rect = this.svg.getBoundingClientRect(); const scale = Math.min(rect.width / 820, rect.height / 680); const offsetX = (rect.width - 820 * scale) / 2; const offsetY = (rect.height - 680 * scale) / 2;
    return { x: rect.left + offsetX + (ox + (point[0] + 0.5) * cell) * scale, y: rect.top + offsetY + (oy + (point[1] + 0.5) * cell) * scale, visible: true };
  }
  diagnostics() { return { renderer: 'SVG tactical map', draws: this.draws, viewport: { width: this.container.clientWidth, height: this.container.clientHeight }, warningCount: this.state?.warning.length ?? 0, playerProjection: this.state ? this.project(this.state.player) : null }; }
  dispose() { clearTimeout(this.effectTimer); this.svg.remove(); }
}
