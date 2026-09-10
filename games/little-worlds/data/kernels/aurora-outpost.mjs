function createGame(level) {
  const copy = JSON.parse(JSON.stringify(level));
  return {
    level: copy,
    player: copy.player.slice(),
    hp: copy.initialHp,
    energy: copy.initialEnergy,
    turn: 0,
    activated: [],
    collected: [],
    warning: copy.hazardCycle[0].map(cell => cell.slice()),
    won: false,
    lost: false
  };
}

function stepGame(state, action) {
  if (!action || typeof action !== 'object' || Array.isArray(action)) return state;
  const type = action.type;
  if (type === 'reset') return createGame(state.level);
  if (state.won || state.lost) return state;

  const level = state.level;
  let x = state.player[0];
  let y = state.player[1];
  let cost = 0;

  if (type === 'move' || type === 'dash') {
    const dx = action.dx;
    const dy = action.dy;
    if (!Number.isInteger(dx) || !Number.isInteger(dy) ||
        Math.abs(dx) + Math.abs(dy) !== 1) return state;
    const distance = type === 'dash' ? 2 : 1;
    cost = type === 'dash' ? 2 : 0;
    for (let i = 0; i < distance; i++) {
      x += dx;
      y += dy;
      if (x < 0 || y < 0 || x >= level.width || y >= level.height ||
          level.walls.some(cell => cell[0] === x && cell[1] === y)) return state;
    }
  } else if (type === 'shield') {
    cost = 1;
  } else if (type !== 'wait') {
    return state;
  }
  if (state.energy < cost) return state;

  const next = JSON.parse(JSON.stringify(state));
  const atDestination = cell => cell[0] === x && cell[1] === y;
  next.player = [x, y];
  next.energy = state.energy - cost;

  for (let i = 0; i < level.beacons.length; i++) {
    if (atDestination(level.beacons[i]) && !next.activated.includes(i)) {
      next.activated.push(i);
    }
  }
  for (let i = 0; i < level.batteries.length; i++) {
    if (atDestination(level.batteries[i]) && !next.collected.includes(i)) {
      next.collected.push(i);
      next.energy = Math.min(level.maxEnergy, next.energy + 2);
    }
  }
  next.activated.sort((a, b) => a - b);
  next.collected.sort((a, b) => a - b);

  if (type !== 'shield' && state.warning.some(atDestination)) {
    next.hp = Math.max(0, state.hp - 1);
  }
  next.turn = state.turn + 1;
  next.warning = next.level.hazardCycle[next.turn % next.level.hazardCycle.length]
    .map(cell => cell.slice());

  next.won = false;
  next.lost = false;
  if (next.hp === 0) {
    next.lost = true;
  } else if (next.activated.length === level.beacons.length && atDestination(level.exit)) {
    next.won = true;
  } else if (next.turn >= level.maxTurns) {
    next.lost = true;
  }
  return next;
}
export {createGame,stepGame};
