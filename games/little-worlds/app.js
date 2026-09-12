import { GameAudio } from './audio.js';

const $ = (id) => document.getElementById(id);
const clone = (value) => JSON.parse(JSON.stringify(value));
const samePoint = (a, b) => a[0] === b[0] && a[1] === b[1];
const canonical = (value) => JSON.stringify(value, (_, item) => item && !Array.isArray(item) && typeof item === 'object' ? Object.keys(item).sort().reduce((result, key) => { result[key] = item[key]; return result; }, {}) : item);
const params = new URLSearchParams(location.search);
const gameId = params.get('game');
const errors = [];
window.addEventListener('error', (event) => errors.push({ time: performance.now(), message: event.message, file: event.filename, line: event.lineno }));
window.addEventListener('unhandledrejection', (event) => errors.push({ time: performance.now(), message: String(event.reason) }));

const copy = {
  'moon-garden': {
    title: 'Moonlight Garden', number: '01 / SPATIAL LOGIC', symbol: '☽', kicker: 'A QUIET PUZZLE',
    intro: 'Welcome to Moonlight Garden', introCopy: 'Push the flower boxes onto the glowing pedestals,<br>and let the night garden bloom again.',
    start: 'Enter the garden', footnote: 'Take your time. Every step can be undone.',
    coordinate: 'THE MOON GARDEN / NIGHT WALK', note: 'No time limit · Think slowly', flavor: 'Bring every flower into the moonlight.',
    objective: 'Moonlit pedestals', levelKickers: ['THE FIRST GARDEN', 'A BRIDGE IN MOONLIGHT', 'TWO STARS ALIGN'],
    rules: '<p><strong>Push flower boxes.</strong> Move with the arrow keys or WASD. Walk into a neighboring box to push it one cell. Boxes cannot be pulled, and only one can move at a time.</p><p><strong>Open the moon bridge.</strong> Every pressure plate must hold a flower box before the gate opens. The gardener alone will not trigger it.</p><p><strong>Let the garden bloom.</strong> Place a box on every golden pedestal. Press Z to undo and R to restart.</p>',
    legend: '<span class="legend-item"><i class="legend-symbol">◎</i>Pedestal</span><span class="legend-item"><i class="legend-symbol plate">◇</i>Pressure plate</span><span class="legend-item"><i class="legend-symbol">▥</i>Moon bridge</span>',
  },
  'aurora-outpost': {
    title: 'Aurora Outpost', number: '02 / TURN-BASED STRATEGY', symbol: '⌁', kicker: 'FIND YOUR WAY HOME',
    intro: 'The storm is coming. Light the way home.', introCopy: 'Activate every beacon, then return to the exit.<br>Orange stripes mark cells the storm will strike after this action.',
    start: 'Begin the mission', footnote: 'There is no real-time countdown. Read the forecast, then decide.',
    coordinate: 'ARCTIC FIELD / ROUTE PLANNING', note: 'After each action · The storm advances', flavor: 'Read the next storm before taking another step.',
    objective: 'Beacon network', levelKickers: ['FIRST CONTACT', 'BETWEEN TWO STORMS', 'THE LAST RETURN'],
    rules: '<p><strong>Connect and return.</strong> Move with the arrow keys or WASD. Beacons activate when you reach them. After activating all of them, return to the exit alive.</p><p><strong>Read the forecast.</strong> Orange stripes show the cells the storm will strike after this action. Standing there costs one health.</p><p><strong>Manage energy.</strong> Hold Shift and choose a direction to dash two cells for two energy. Press E to spend one energy on a one-turn shield; Space waits. Each battery restores two energy once.</p><p>A dash skips the middle cell without triggering its beacon, battery, or damage. Blocked moves do not advance the turn. Press R to restart.</p>',
    legend: '<span class="legend-item"><i class="legend-symbol">◉</i>Beacon</span><span class="legend-item"><i class="legend-symbol battery">ϟ</i>Battery</span><span class="legend-item"><i class="legend-symbol">⌂</i>Exit</span><span class="legend-item"><i class="legend-symbol danger">▨</i>Storm forecast</span>',
  },
};

let state = null, levels = [], kernel = null, scene = null, provenance = null;
let levelIndex = 0, mode = 'intro', dashMode = false, inputLog = [], stateLog = [], sessions = [];
let toastTimer = null, sessionStart = performance.now(), active = false;
const audio = new GameAudio();

async function boot() {
  if (!gameId) return;
  if (!copy[gameId]) throw new Error('This game was not found. Please choose it again from the home page.');
  $('home').hidden = true; $('loading').hidden = false;
  const manifestResponse = await fetch('./data/manifest.json', { cache: 'no-store' });
  if (!manifestResponse.ok) throw new Error(`The game manifest is unavailable (HTTP ${manifestResponse.status}). Please refresh shortly.`);
  const manifest = await manifestResponse.json();
  const entry = manifest.games?.[gameId];
  if (!entry) throw new Error('The current manifest does not include this game kernel.');
  const requestedRun = params.get('run') || entry.defaultRun;
  const runList = Array.isArray(entry.runs) ? entry.runs : Object.entries(entry.runs || {}).map(([id, value]) => ({ id, ...value }));
  const selected = runList.find((run) => run.id === requestedRun);
  if (!selected && params.has('run')) throw new Error('The requested experimental run was not found. Remove the run parameter and try again.');
  const kernelUrl = selected?.kernelUrl || entry.kernelUrl;
  provenance = { id: requestedRun, kind: selected?.kind || 'unknown', condition: selected?.condition || 'Not recorded', model: selected?.model || 'No model identifier in the run record', kernelUrl, manifestSchema: manifest.schema || 'unknown', ...selected };
  const [module, levelResponse] = await Promise.all([import(kernelUrl), fetch(entry.levelsUrl || `./data/levels/${gameId}.json`, { cache: 'no-store' })]);
  if (!levelResponse.ok) throw new Error(`The level failed to load (HTTP ${levelResponse.status}).`);
  levels = await levelResponse.json();
  if (!Array.isArray(levels) || !levels.length) throw new Error('No levels are available.');
  if (typeof module.createGame !== 'function' || typeof module.stepGame !== 'function') throw new Error('The active kernel does not provide the createGame / stepGame interface.');
  kernel = { createGame: module.createGame, stepGame: module.stepGame };
  const queryLevel = params.get('level');
  if (queryLevel) { const index = levels.findIndex((level) => level.id === queryLevel); levelIndex = index >= 0 ? index : Math.max(0, Math.min(levels.length - 1, (Number(queryLevel) || 1) - 1)); }
  configure(); $('loading').hidden = true; $('game').hidden = false;
  if (gameId === 'moon-garden') { const { MoonScene } = await import('./moon-scene.js'); scene = new MoonScene($('scene')); }
  else { const { AuroraScene } = await import('./aurora-scene.js'); scene = new AuroraScene($('scene'), clickCell); }
  loadLevel(levelIndex, true);
  wireEvents(); updateSoundButton(); exposeReadOnly();
}

function configure() {
  const info = copy[gameId];
  document.title = `${info.title} · Little Worlds`;
  $('game').classList.toggle('aurora', gameId === 'aurora-outpost');
  $('game-number').textContent = info.number; $('game-title').textContent = info.title;
  $('scene-coordinate').textContent = info.coordinate; $('scene-note').textContent = info.note;
  $('world-flavor').textContent = info.flavor; $('objective-label').textContent = info.objective;
  $('rules-copy').innerHTML = info.rules; $('board-legend').innerHTML = info.legend;
  if (gameId === 'moon-garden') $('special-controls').innerHTML = '<button id="undo" class="special-button" type="button"><span>↶ Undo one move</span><span>Z</span></button>';
  else $('special-controls').innerHTML = '<button id="dash" class="special-button" type="button" aria-pressed="false"><span>↠ Dash mode</span><span>Shift + direction · 2ϟ</span></button><button id="shield" class="special-button" type="button"><span>◇ Raise shield</span><span>E · 1ϟ</span></button><button id="wait" class="special-button" type="button"><span>◷ Wait one turn</span><span>Space</span></button>';
  const rows = [ ['Rules kernel', provenance.kind === 'reference' ? 'Reference implementation for integration testing; not a model-generated sample' : provenance.kind === 'generated' || provenance.kind === 'model-generated' ? 'Codex-generated implementation' : `${provenance.kind} (as recorded)`], ['Run ID', provenance.id], ['Condition', provenance.condition], ['Model record', provenance.model], ['Rules file', provenance.kernelUrl] ];
  const dl = $('provenance'); dl.replaceChildren();
  rows.forEach(([label, value]) => { const dt = document.createElement('dt'); const dd = document.createElement('dd'); dt.textContent = label; dd.textContent = typeof value === 'string' ? value : JSON.stringify(value); dl.append(dt, dd); });
}

function loadLevel(index, introduction = false) {
  if (state && inputLog.length) sessions.push(exportCurrent());
  levelIndex = index; state = kernel.createGame(clone(levels[index])); mode = introduction ? 'intro' : 'playing'; active = !introduction;
  inputLog = []; stateLog = [{ atMs: 0, inputIndex: -1, state: clone(state) }]; sessionStart = performance.now(); dashMode = false;
  $('level-index').textContent = `${String(index + 1).padStart(2, '0')} / ${String(levels.length).padStart(2, '0')}`;
  $('level-kicker').textContent = copy[gameId].levelKickers[index] || 'ANOTHER WAY TO THINK';
  $('level-title').textContent = levels[index].title; $('level-hint').textContent = levels[index].hint;
  $('level-prev').disabled = index === 0; $('level-next').disabled = index === levels.length - 1;
  scene.loadLevel(levels[index], state); updateHUD(); clearTimeout(toastTimer); $('toast').classList.remove('show');
  if (introduction) showIntroduction(); else if (state.won || state.lost) showTerminal(); else hideOverlay();
}

function updateHUD() {
  const terminal = state.won || state.lost; const disabled = !active || terminal;
  document.querySelectorAll('[data-direction]').forEach((button) => { button.disabled = disabled; });
  if (gameId === 'moon-garden') {
    const completed = state.level.goals.filter((goal) => state.crates.some((crate) => samePoint(goal, crate))).length;
    $('objective-count').textContent = `${completed} / ${state.level.goals.length}`;
    $('progress-pips').innerHTML = state.level.goals.map((goal) => `<i class="${state.crates.some((crate) => samePoint(goal, crate)) ? 'filled' : ''}"></i>`).join('');
    $('objective-detail').textContent = completed === state.level.goals.length ? 'Every flower box has found its moonlight.' : 'Push each flower box onto a golden-ringed pedestal.';
    $('resources').innerHTML = `<div class="resource-row"><span>Moves</span><span class="resource-amount mono">${state.moves}</span></div>${state.level.doors.length ? `<div class="resource-row"><span>Moon bridge</span><span class="resource-amount door-state">${state.doorsOpen ? 'Open ◇' : 'Waiting for plates ▥'}</span></div>` : '<div class="resource-row"><span>Undo</span><span class="resource-amount">Available anytime ↶</span></div>'}`;
    $('move-summary').textContent = `${String(state.moves).padStart(2, '0')} STEPS`;
    $('undo').disabled = !active || !state.history.length;
    $('status-caption').textContent = provenance.kind === 'reference' ? 'Reference-kernel integration · Move / Z undo' : 'Move / Z undo / R restart';
  } else {
    const completed = state.activated.length;
    $('objective-count').textContent = `${completed} / ${state.level.beacons.length}`;
    $('progress-pips').innerHTML = state.level.beacons.map((_, index) => `<i class="${state.activated.includes(index) ? 'filled' : ''}"></i>`).join('');
    $('objective-detail').textContent = completed === state.level.beacons.length ? 'All beacons are connected. Return to the exit ⌂' : 'Reach each beacon, activate it, and return to the exit alive.';
    $('resources').innerHTML = `<div class="resource-row"><span>Health</span><span class="resource-amount">${Array.from({ length: state.level.initialHp }, (_, i) => `<span class="heart ${i < state.hp ? '' : 'empty'}">♥</span>`).join('')}</span></div><div class="resource-row"><span>Energy</span><span class="resource-amount"><span class="energy-bars">${Array.from({ length: state.level.maxEnergy }, (_, i) => `<i class="${i < state.energy ? 'full' : ''}"></i>`).join('')}</span><span class="mono">${state.energy}/${state.level.maxEnergy}</span></span></div><div class="resource-row"><span>Actions left</span><span class="resource-amount mono">${Math.max(0, state.level.maxTurns - state.turn)} / ${state.level.maxTurns}</span></div>`;
    $('move-summary').textContent = `TURN ${String(state.turn).padStart(2, '0')} / ${state.level.maxTurns}`;
    $('dash').disabled = disabled; $('shield').disabled = disabled; $('wait').disabled = disabled;
    $('dash').setAttribute('aria-pressed', String(dashMode)); $('dash').firstElementChild.textContent = dashMode ? '↠ Choose dash direction' : '↠ Dash mode';
    $('status-caption').textContent = provenance.kind === 'reference' ? 'Reference-kernel integration · Storm advances after every valid action' : dashMode ? 'Dash mode: move two cells for two energy' : 'The storm advances after every valid action';
  }
}

function showIntroduction() {
  const info = copy[gameId]; $('overlay').hidden = false; $('overlay-symbol').textContent = info.symbol;
  $('overlay-kicker').textContent = info.kicker; $('overlay-title').textContent = info.intro; $('overlay-copy').innerHTML = info.introCopy;
  $('overlay-footnote').textContent = info.footnote;
  $('overlay-facts').innerHTML = gameId === 'moon-garden' ? '<div class="overlay-fact"><strong>↑↓←→</strong>Move and push</div><div class="overlay-fact"><strong>Z</strong>Undo one move</div>' : '<div class="overlay-fact"><strong>↑↓←→</strong>Move</div><div class="overlay-fact"><strong>Shift</strong>+ direction to dash</div><div class="overlay-fact"><strong>E</strong>Raise a shield</div>';
  setPrimary(info.start, start); $('secondary-action').hidden = true;
}

function start() {
  audio.arm().then(() => audio.play('start')); active = true; mode = 'playing';
  inputLog.push({ atMs: performance.now() - sessionStart, source: 'button', action: { type: 'ui-start' }, accepted: true });
  hideOverlay(); updateHUD();
  if (state.won || state.lost) showTerminal();
}

function setPrimary(label, handler) { $('primary-action').replaceChildren(document.createTextNode(label)); const arrow = document.createElement('span'); arrow.textContent = '→'; $('primary-action').append(arrow); $('primary-action').onclick = handler; }
function hideOverlay() { if ($('overlay').contains(document.activeElement)) document.activeElement.blur(); $('overlay').hidden = true; }

function showTerminal() {
  mode = state.won ? 'won' : 'lost'; $('overlay').hidden = false;
  $('overlay-symbol').textContent = state.won ? '✦' : '⌁';
  $('overlay-kicker').textContent = state.won ? gameId === 'moon-garden' ? 'THE GARDEN BLOOMS' : 'SIGNAL RESTORED' : 'CONNECTION LOST';
  $('overlay-title').textContent = state.won ? gameId === 'moon-garden' ? 'The garden blooms tonight' : 'The way home is lit' : state.hp === 0 ? 'The storm swallowed the signal' : 'The return window has closed';
  $('overlay-copy').innerHTML = state.won ? gameId === 'moon-garden' ? 'Every flower box rests in the moonlight.<br>Carry this quiet into the next garden.' : 'Every beacon is connected.<br>You have found your link to the snowfield again.' : state.hp === 0 ? 'Your health is gone, and the mission pauses here.<br>Next time, let the forecast guide you.' : 'The action limit has passed before your return.<br>Try dashing to save distance.';
  $('overlay-facts').innerHTML = gameId === 'moon-garden' ? `<div class="overlay-fact"><strong>${state.moves}</strong>Moves</div><div class="overlay-fact"><strong>${state.crates.length}</strong>Flowers placed</div>` : `<div class="overlay-fact"><strong>${state.turn}</strong>Turns used</div><div class="overlay-fact"><strong>${state.activated.length}/${state.level.beacons.length}</strong>Beacons</div><div class="overlay-fact"><strong>${state.hp}</strong>Health</div>`;
  $('overlay-footnote').textContent = state.won && levelIndex === levels.length - 1 ? 'The journey is complete. You can always return to find another route.' : state.won ? 'The next level recombines the rules you now know.' : 'Losing one signal never removes the chance to begin again.';
  setPrimary(state.won && levelIndex < levels.length - 1 ? 'Continue to the next level' : 'Restart', () => state.won && levelIndex < levels.length - 1 ? loadLevel(levelIndex + 1) : reset('terminal-button'));
  $('secondary-action').hidden = gameId !== 'moon-garden' || !state.history.length;
  $('secondary-action').onclick = () => dispatch({ type: 'undo' }, 'terminal-button');
}

function toast(message, danger = false) {
  clearTimeout(toastTimer); $('toast').textContent = message; $('toast').classList.toggle('danger', danger); $('toast').classList.add('show');
  toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2300);
}

function dispatch(action, source) {
  if (!active && action.type !== 'reset') return;
  const previous = clone(state);
  try {
    const result = kernel.stepGame(state, clone(action));
    if (!result || typeof result !== 'object') throw new Error('The rules kernel did not return a displayable state.');
    state = result;
    const accepted = canonical(previous) !== canonical(state);
    inputLog.push({ atMs: performance.now() - sessionStart, source, action: clone(action), accepted });
    stateLog.push({ atMs: performance.now() - sessionStart, inputIndex: inputLog.length - 1, state: clone(state) });
    scene.update(state, previous, action);
    if (action.type === 'reset') { dashMode = false; active = true; mode = 'playing'; hideOverlay(); audio.play('reset'); toast('Starting again'); }
    else if (!accepted) { audio.play('blocked'); toast(action.type === 'undo' ? 'You are already at the first move' : state.won || state.lost ? 'This level has ended' : gameId === 'moon-garden' ? 'That way is blocked—try another direction' : 'That action is blocked or needs more energy'); }
    else if (gameId === 'moon-garden') {
      if (action.type === 'undo') { hideOverlay(); mode = 'playing'; audio.play('undo'); toast('Returned to the previous move'); }
      else if (!previous.doorsOpen && state.doorsOpen) { audio.play('beacon'); toast('Every plate is held—the moon bridge is open'); }
      else if (canonical(previous.crates) !== canonical(state.crates)) audio.play('push');
      else audio.play('move');
    } else if (accepted) {
      const notes = [];
      if (state.activated.length > previous.activated.length) notes.push('Beacon connected');
      if (state.collected.length > previous.collected.length) notes.push('Battery collected');
      if (state.hp < previous.hp) notes.push('Storm hit: health −1');
      if (action.type === 'shield') notes.push('Shield protected this turn');
      if (notes.length) toast(notes.join(' · '), state.hp < previous.hp);
      audio.play(state.hp < previous.hp ? 'damage' : state.activated.length > previous.activated.length ? 'beacon' : state.collected.length > previous.collected.length ? 'battery' : ['dash', 'shield'].includes(action.type) ? action.type : 'move');
    }
    updateHUD();
    if ((state.won || state.lost) && !(previous.won || previous.lost)) { audio.play(state.won ? 'win' : 'loss'); showTerminal(); }
    else if (!state.won && !state.lost) mode = 'playing';
  } catch (error) { errors.push({ time: performance.now(), action: clone(action), message: String(error) }); toast('The rules engine encountered an error; the action was retained in the log.', true); console.error(error); }
}

function direction(dx, dy, source, dash = false) { dispatch({ type: gameId === 'aurora-outpost' && (dash || dashMode) ? 'dash' : 'move', dx, dy }, source); }
function reset(source) { dispatch({ type: 'reset' }, source); }
function clickCell(point) {
  if (!active || mode !== 'playing') return;
  const dx = point[0] - state.player[0], dy = point[1] - state.player[1];
  if (Math.abs(dx) + Math.abs(dy) === 1) direction(dx, dy, 'map-click');
  else if (dashMode && (Math.abs(dx) === 2 && dy === 0 || Math.abs(dy) === 2 && dx === 0)) direction(Math.sign(dx), Math.sign(dy), 'map-click', true);
  else toast('Click a neighboring cell to move; use the direction keys for longer routes');
}
function updateSoundButton() { $('mute-label').textContent = audio.enabled ? 'Sound on' : 'Sound off'; $('mute').setAttribute('aria-label', audio.enabled ? 'Disable sound' : 'Enable sound'); }

function wireEvents() {
  $('scene').tabIndex = 0;
  $('scene').addEventListener('pointerdown', () => $('scene').focus({ preventScroll: true }));
  $('game').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (event.detail > 0 && button && !$('research').contains(button)) $('scene').focus({ preventScroll: true });
  });
  document.querySelectorAll('[data-direction]').forEach((button) => button.addEventListener('click', () => { const [dx, dy] = button.dataset.direction.split(',').map(Number); direction(dx, dy, 'direction-button'); }));
  $('restart-top').addEventListener('click', () => reset('restart-button'));
  $('mute').addEventListener('click', () => { audio.toggle(); updateSoundButton(); });
  $('level-prev').addEventListener('click', () => loadLevel(Math.max(0, levelIndex - 1)));
  $('level-next').addEventListener('click', () => loadLevel(Math.min(levels.length - 1, levelIndex + 1)));
  $('undo')?.addEventListener('click', () => dispatch({ type: 'undo' }, 'undo-button'));
  $('dash')?.addEventListener('click', () => { dashMode = !dashMode; updateHUD(); if (dashMode) toast('Dash mode: choose a direction to move two cells'); });
  $('shield')?.addEventListener('click', () => dispatch({ type: 'shield' }, 'shield-button'));
  $('wait')?.addEventListener('click', () => dispatch({ type: 'wait' }, 'wait-button'));
  $('export-run').addEventListener('click', () => { const blob = new Blob([JSON.stringify({ ...exportCurrent(), previousSessions: sessions }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${gameId}-${levels[levelIndex].id}-playlog.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); });
  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    const key = event.key.toLowerCase();
    if (!['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'z', 'r', 'e', 'm', ' '].includes(key)) return;
    if (event.target.tagName === 'BUTTON' && key === ' ') return;
    event.preventDefault(); if (event.repeat) return;
    if (key === 'm') { audio.toggle(); updateSoundButton(); return; }
    if (key === 'r') { reset('keyboard'); return; }
    if (!active) return;
    const dirs = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] };
    if (dirs[key]) direction(...dirs[key], 'keyboard', event.shiftKey);
    if (key === 'z' && gameId === 'moon-garden') dispatch({ type: 'undo' }, 'keyboard');
    if (key === 'e' && gameId === 'aurora-outpost') dispatch({ type: 'shield' }, 'keyboard');
    if (key === ' ' && gameId === 'aurora-outpost') dispatch({ type: 'wait' }, 'keyboard');
  });
}

function exportCurrent() { return clone({ schema: 'stage2.browser-run.v1', game: gameId, run: provenance, level: levels[levelIndex]?.id, mode, inputLog, stateLog, finalState: state, errors, renderer: scene?.diagnostics(), audio: audio.diagnostics(), viewport: { width: innerWidth, height: innerHeight, devicePixelRatio }, userAgent: navigator.userAgent }); }
function exposeReadOnly() {
  window.__STAGE2__ = Object.freeze({
    snapshot: () => clone(state),
    exportRun: () => exportCurrent(),
    diagnostics: () => clone({ mode, game: gameId, levelIndex, levels: levels.map((level) => ({ id: level.id, title: level.title })), run: provenance, renderer: scene.diagnostics(), audio: audio.diagnostics(), errors }),
    projectedCell: (point) => scene.project(point),
  });
}

boot().catch((error) => { errors.push({ time: performance.now(), message: String(error) }); console.error(error); $('home').hidden = true; $('loading').hidden = true; $('game').hidden = true; $('fatal').hidden = false; $('fatal-message').textContent = String(error.message || error); });
