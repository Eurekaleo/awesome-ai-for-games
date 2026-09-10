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
    title: '月光花园', number: '01 / SPATIAL LOGIC', symbol: '☽', kicker: 'A QUIET PUZZLE',
    intro: '欢迎来到月光花园', introCopy: '把花箱推到发光的花台上，<br>让这座夜晚的花园重新绽放。',
    start: '走进花园', footnote: '不必着急，每一步都可以撤回。',
    coordinate: 'THE MOON GARDEN / NIGHT WALK', note: '没有时限 · 慢慢想', flavor: '让每一盆花，都走到月光里。',
    objective: '月光花台', levelKickers: ['THE FIRST GARDEN', 'A BRIDGE IN MOONLIGHT', 'TWO STARS ALIGN'],
    rules: '<p><strong>推动花箱</strong>：方向键或 WASD 移动；站在花箱旁，向它前进就能推一格。花箱无法拉动，也不能一次推两只。</p><p><strong>打开月桥</strong>：所有压板都被花箱压住时，桥门才会打开。园丁踩上去不会触发。</p><p><strong>让花园绽放</strong>：每座金色花台上都有花箱就完成。按 Z 撤回，按 R 重开。</p>',
    legend: '<span class="legend-item"><i class="legend-symbol">◎</i>月光花台</span><span class="legend-item"><i class="legend-symbol plate">◇</i>压板</span><span class="legend-item"><i class="legend-symbol">▥</i>月桥</span>',
  },
  'aurora-outpost': {
    title: '极光哨站', number: '02 / TURN-BASED STRATEGY', symbol: '⌁', kicker: 'FIND YOUR WAY HOME',
    intro: '风暴来临，点亮归途', introCopy: '启动全部信标，再回到出口。<br>橙色条纹标出本次行动后会受袭的格子。',
    start: '开启任务', footnote: '没有实时倒计时。观察预告，再做决定。',
    coordinate: 'ARCTIC FIELD / ROUTE PLANNING', note: '行动之后 · 风暴来袭', flavor: '看清下一场风暴，再向前一步。',
    objective: '信标连接', levelKickers: ['FIRST CONTACT', 'BETWEEN TWO STORMS', 'THE LAST RETURN'],
    rules: '<p><strong>连接与返回</strong>：方向键或 WASD 移动，抵达信标会自动启动。全部启动后，要活着回到出口。</p><p><strong>读懂预告</strong>：橙色条纹是本次行动后受袭的区域。站在其中会失去 1 点生命。</p><p><strong>调度能量</strong>：Shift ＋方向冲刺两格，耗 2 能量；E 原地开盾，耗 1 能量并挡住本轮伤害；Space 原地等待。电池补充 2 能量，每块只用一次。</p><p>冲刺跳过的中间格不会触发信标、电池或伤害。撞墙或能量不足不会推进回合。按 R 重新开始。</p>',
    legend: '<span class="legend-item"><i class="legend-symbol">◉</i>信标</span><span class="legend-item"><i class="legend-symbol battery">ϟ</i>电池</span><span class="legend-item"><i class="legend-symbol">⌂</i>出口</span><span class="legend-item"><i class="legend-symbol danger">▨</i>风暴预告</span>',
  },
};

let state = null, levels = [], kernel = null, scene = null, provenance = null;
let levelIndex = 0, mode = 'intro', dashMode = false, inputLog = [], stateLog = [], sessions = [];
let toastTimer = null, sessionStart = performance.now(), active = false;
const audio = new GameAudio();

async function boot() {
  if (!gameId) return;
  if (!copy[gameId]) throw new Error('找不到这个游戏。请从首页重新选择。');
  $('home').hidden = true; $('loading').hidden = false;
  const manifestResponse = await fetch('./data/manifest.json', { cache: 'no-store' });
  if (!manifestResponse.ok) throw new Error(`游戏清单未就绪（HTTP ${manifestResponse.status}）。请稍后刷新。`);
  const manifest = await manifestResponse.json();
  const entry = manifest.games?.[gameId];
  if (!entry) throw new Error('当前清单中没有这个游戏的内核。');
  const requestedRun = params.get('run') || entry.defaultRun;
  const runList = Array.isArray(entry.runs) ? entry.runs : Object.entries(entry.runs || {}).map(([id, value]) => ({ id, ...value }));
  const selected = runList.find((run) => run.id === requestedRun);
  if (!selected && params.has('run')) throw new Error('找不到指定的实验运行；请移除 run 参数后重试。');
  const kernelUrl = selected?.kernelUrl || entry.kernelUrl;
  provenance = { id: requestedRun, kind: selected?.kind || 'unknown', condition: selected?.condition || '未记录', model: selected?.model || '运行记录未提供具体模型标识', kernelUrl, manifestSchema: manifest.schema || 'unknown', ...selected };
  const [module, levelResponse] = await Promise.all([import(kernelUrl), fetch(entry.levelsUrl || `./data/levels/${gameId}.json`, { cache: 'no-store' })]);
  if (!levelResponse.ok) throw new Error(`关卡加载失败（HTTP ${levelResponse.status}）。`);
  levels = await levelResponse.json();
  if (!Array.isArray(levels) || !levels.length) throw new Error('没有可用的关卡。');
  if (typeof module.createGame !== 'function' || typeof module.stepGame !== 'function') throw new Error('当前内核缺少 createGame / stepGame 接口。');
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
  document.title = `${info.title} · 小世界`;
  $('game').classList.toggle('aurora', gameId === 'aurora-outpost');
  $('game-number').textContent = info.number; $('game-title').textContent = info.title;
  $('scene-coordinate').textContent = info.coordinate; $('scene-note').textContent = info.note;
  $('world-flavor').textContent = info.flavor; $('objective-label').textContent = info.objective;
  $('rules-copy').innerHTML = info.rules; $('board-legend').innerHTML = info.legend;
  if (gameId === 'moon-garden') $('special-controls').innerHTML = '<button id="undo" class="special-button" type="button"><span>↶ 撤回一步</span><span>Z</span></button>';
  else $('special-controls').innerHTML = '<button id="dash" class="special-button" type="button" aria-pressed="false"><span>↠ 冲刺模式</span><span>Shift ＋方向 · 2ϟ</span></button><button id="shield" class="special-button" type="button"><span>◇ 原地开盾</span><span>E · 1ϟ</span></button><button id="wait" class="special-button" type="button"><span>◷ 等待一轮</span><span>Space</span></button>';
  const rows = [ ['规则内核', provenance.kind === 'reference' ? '参考实现（用于联调，不是模型生成样本）' : provenance.kind === 'generated' || provenance.kind === 'model-generated' ? 'Codex 生成实现' : `${provenance.kind}（按运行记录标注）`], ['运行 ID', provenance.id], ['实验条件', provenance.condition], ['模型记录', provenance.model], ['规则文件', provenance.kernelUrl] ];
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
    $('objective-detail').textContent = completed === state.level.goals.length ? '每一盆花，都找到了自己的月光。' : '把每只花箱推到金色圆环的花台上。';
    $('resources').innerHTML = `<div class="resource-row"><span>已经走过</span><span class="resource-amount mono">${state.moves} 步</span></div>${state.level.doors.length ? `<div class="resource-row"><span>月桥</span><span class="resource-amount door-state">${state.doorsOpen ? '已打开 ◇' : '等待压板 ▥'}</span></div>` : '<div class="resource-row"><span>撤回</span><span class="resource-amount">随时可以 ↶</span></div>'}`;
    $('move-summary').textContent = `${String(state.moves).padStart(2, '0')} STEPS`;
    $('undo').disabled = !active || !state.history.length;
    $('status-caption').textContent = provenance.kind === 'reference' ? '参考内核联调 · 方向移动 / Z 撤回' : '方向移动 / Z 撤回 / R 重开';
  } else {
    const completed = state.activated.length;
    $('objective-count').textContent = `${completed} / ${state.level.beacons.length}`;
    $('progress-pips').innerHTML = state.level.beacons.map((_, index) => `<i class="${state.activated.includes(index) ? 'filled' : ''}"></i>`).join('');
    $('objective-detail').textContent = completed === state.level.beacons.length ? '信标全部连接。现在回到出口 ⌂' : '抵达信标启动连接，再活着回到出口。';
    $('resources').innerHTML = `<div class="resource-row"><span>生命</span><span class="resource-amount">${Array.from({ length: state.level.initialHp }, (_, i) => `<span class="heart ${i < state.hp ? '' : 'empty'}">♥</span>`).join('')}</span></div><div class="resource-row"><span>能量</span><span class="resource-amount"><span class="energy-bars">${Array.from({ length: state.level.maxEnergy }, (_, i) => `<i class="${i < state.energy ? 'full' : ''}"></i>`).join('')}</span><span class="mono">${state.energy}/${state.level.maxEnergy}</span></span></div><div class="resource-row"><span>剩余行动</span><span class="resource-amount mono">${Math.max(0, state.level.maxTurns - state.turn)} / ${state.level.maxTurns}</span></div>`;
    $('move-summary').textContent = `TURN ${String(state.turn).padStart(2, '0')} / ${state.level.maxTurns}`;
    $('dash').disabled = disabled; $('shield').disabled = disabled; $('wait').disabled = disabled;
    $('dash').setAttribute('aria-pressed', String(dashMode)); $('dash').firstElementChild.textContent = dashMode ? '↠ 选择冲刺方向' : '↠ 冲刺模式';
    $('status-caption').textContent = provenance.kind === 'reference' ? '参考内核联调 · 每次有效行动后，风暴推进一轮' : dashMode ? '冲刺模式：按方向前进两格，消耗 2 能量' : '每次有效行动后，风暴推进一轮';
  }
}

function showIntroduction() {
  const info = copy[gameId]; $('overlay').hidden = false; $('overlay-symbol').textContent = info.symbol;
  $('overlay-kicker').textContent = info.kicker; $('overlay-title').textContent = info.intro; $('overlay-copy').innerHTML = info.introCopy;
  $('overlay-footnote').textContent = info.footnote;
  $('overlay-facts').innerHTML = gameId === 'moon-garden' ? '<div class="overlay-fact"><strong>↑↓←→</strong>移动与推动</div><div class="overlay-fact"><strong>Z</strong>撤回一步</div>' : '<div class="overlay-fact"><strong>↑↓←→</strong>移动</div><div class="overlay-fact"><strong>Shift</strong>＋方向冲刺</div><div class="overlay-fact"><strong>E</strong>原地开盾</div>';
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
  $('overlay-title').textContent = state.won ? gameId === 'moon-garden' ? '今夜，花园绽放' : '归途，已经点亮' : state.hp === 0 ? '风暴淹没了信号' : '返航窗口已经关闭';
  $('overlay-copy').innerHTML = state.won ? gameId === 'moon-garden' ? '每一盆花都停在了月光里。<br>把这份安静，留给下一座花园。' : '全部信标连接成功。<br>你与这片雪原，重新建立了联系。' : state.hp === 0 ? '生命耗尽，任务暂时中断。<br>下一次，让风暴预告为你指路。' : '行动次数耗尽，仍未完成返航。<br>试试用冲刺节省路程。';
  $('overlay-facts').innerHTML = gameId === 'moon-garden' ? `<div class="overlay-fact"><strong>${state.moves}</strong>完成步数</div><div class="overlay-fact"><strong>${state.crates.length}</strong>花台绽放</div>` : `<div class="overlay-fact"><strong>${state.turn}</strong>已用回合</div><div class="overlay-fact"><strong>${state.activated.length}/${state.level.beacons.length}</strong>信标连接</div><div class="overlay-fact"><strong>${state.hp}</strong>剩余生命</div>`;
  $('overlay-footnote').textContent = state.won && levelIndex === levels.length - 1 ? '这一程已经完成。也可以回来，寻找不同的走法。' : state.won ? '下一关，会把熟悉的规则重新组合。' : '失去一次信号，不会失去重新开始的机会。';
  setPrimary(state.won && levelIndex < levels.length - 1 ? '前往下一关' : '重新开始', () => state.won && levelIndex < levels.length - 1 ? loadLevel(levelIndex + 1) : reset('terminal-button'));
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
    if (!result || typeof result !== 'object') throw new Error('规则内核没有返回可显示的状态。');
    state = result;
    const accepted = canonical(previous) !== canonical(state);
    inputLog.push({ atMs: performance.now() - sessionStart, source, action: clone(action), accepted });
    stateLog.push({ atMs: performance.now() - sessionStart, inputIndex: inputLog.length - 1, state: clone(state) });
    scene.update(state, previous, action);
    if (action.type === 'reset') { dashMode = false; active = true; mode = 'playing'; hideOverlay(); audio.play('reset'); toast('重新出发'); }
    else if (!accepted) { audio.play('blocked'); toast(action.type === 'undo' ? '已经在最初的位置' : state.won || state.lost ? '本关已经结束' : gameId === 'moon-garden' ? '前路受阻，试着换个方向' : '这一步不可执行：方向受阻或能量不足'); }
    else if (gameId === 'moon-garden') {
      if (action.type === 'undo') { hideOverlay(); mode = 'playing'; audio.play('undo'); toast('回到上一步'); }
      else if (!previous.doorsOpen && state.doorsOpen) { audio.play('beacon'); toast('压板齐备，月桥打开了'); }
      else if (canonical(previous.crates) !== canonical(state.crates)) audio.play('push');
      else audio.play('move');
    } else if (accepted) {
      const notes = [];
      if (state.activated.length > previous.activated.length) notes.push('信标已连接');
      if (state.collected.length > previous.collected.length) notes.push('电池已收集');
      if (state.hp < previous.hp) notes.push('风暴命中，生命 −1');
      if (action.type === 'shield') notes.push('护盾保护本轮行动');
      if (notes.length) toast(notes.join(' · '), state.hp < previous.hp);
      audio.play(state.hp < previous.hp ? 'damage' : state.activated.length > previous.activated.length ? 'beacon' : state.collected.length > previous.collected.length ? 'battery' : ['dash', 'shield'].includes(action.type) ? action.type : 'move');
    }
    updateHUD();
    if ((state.won || state.lost) && !(previous.won || previous.lost)) { audio.play(state.won ? 'win' : 'loss'); showTerminal(); }
    else if (!state.won && !state.lost) mode = 'playing';
  } catch (error) { errors.push({ time: performance.now(), action: clone(action), message: String(error) }); toast('规则执行遇到错误，已保留操作记录。', true); console.error(error); }
}

function direction(dx, dy, source, dash = false) { dispatch({ type: gameId === 'aurora-outpost' && (dash || dashMode) ? 'dash' : 'move', dx, dy }, source); }
function reset(source) { dispatch({ type: 'reset' }, source); }
function clickCell(point) {
  if (!active || mode !== 'playing') return;
  const dx = point[0] - state.player[0], dy = point[1] - state.player[1];
  if (Math.abs(dx) + Math.abs(dy) === 1) direction(dx, dy, 'map-click');
  else if (dashMode && (Math.abs(dx) === 2 && dy === 0 || Math.abs(dy) === 2 && dx === 0)) direction(Math.sign(dx), Math.sign(dy), 'map-click', true);
  else toast('点击相邻格移动；远行时可使用方向键');
}
function updateSoundButton() { $('mute-label').textContent = audio.enabled ? '音效开启' : '音效关闭'; $('mute').setAttribute('aria-label', audio.enabled ? '关闭音效' : '开启音效'); }

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
  $('dash')?.addEventListener('click', () => { dashMode = !dashMode; updateHUD(); if (dashMode) toast('冲刺模式：按方向前进两格'); });
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
