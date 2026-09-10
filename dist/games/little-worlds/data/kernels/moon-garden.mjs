function createGame(level) {
  const savedLevel = JSON.parse(JSON.stringify(level));
  const crates = savedLevel.crates.map(cell => cell.slice());
  const covered = cells => cells.every(([x, y]) =>
    crates.some(crate => crate[0] === x && crate[1] === y));
  return {
    level: savedLevel,
    player: savedLevel.player.slice(),
    crates,
    moves: 0,
    doorsOpen: savedLevel.plates.length > 0 && covered(savedLevel.plates),
    won: covered(savedLevel.goals),
    history: []
  };
}

function stepGame(state, action) {
  if (!action || typeof action !== 'object' || Array.isArray(action)) return state;
  if (action.type === 'reset') return createGame(state.level);

  const level = state.level;
  const contains = (cells, x, y) =>
    cells.some(cell => cell[0] === x && cell[1] === y);
  const status = crates => ({
    doorsOpen: level.plates.length > 0 &&
      level.plates.every(([x, y]) => contains(crates, x, y)),
    won: level.goals.every(([x, y]) => contains(crates, x, y))
  });

  if (action.type === 'undo') {
    if (state.history.length === 0) return state;
    const previous = state.history[state.history.length - 1];
    const crates = previous.crates.map(cell => cell.slice());
    return {
      level,
      player: previous.player.slice(),
      crates,
      moves: previous.moves,
      ...status(crates),
      history: state.history.slice(0, -1)
    };
  }

  if (action.type !== 'move' || state.won) return state;
  const { dx, dy } = action;
  if (!Number.isInteger(dx) || !Number.isInteger(dy) ||
      Math.abs(dx) + Math.abs(dy) !== 1) return state;

  // Both destination checks use the door status before the move.
  const doorsOpenBefore = state.doorsOpen;
  const canEnter = (x, y) =>
    x >= 0 && x < level.width && y >= 0 && y < level.height &&
    !contains(level.walls, x, y) &&
    (doorsOpenBefore || !contains(level.doors, x, y));
  const x = state.player[0] + dx;
  const y = state.player[1] + dy;
  if (!canEnter(x, y)) return state;

  const crateIndex = state.crates.findIndex(crate => crate[0] === x && crate[1] === y);
  if (crateIndex !== -1 &&
      (!canEnter(x + dx, y + dy) || contains(state.crates, x + dx, y + dy))) {
    return state;
  }

  const crates = state.crates.map(cell => cell.slice());
  if (crateIndex !== -1) crates[crateIndex] = [x + dx, y + dy];
  // The preceding history entries are the snapshot's earlier history stack.
  const previous = {
    player: state.player.slice(),
    crates: state.crates.map(cell => cell.slice()),
    moves: state.moves,
    doorsOpen: state.doorsOpen,
    won: state.won
  };
  return {
    level,
    player: [x, y],
    crates,
    moves: state.moves + 1,
    ...status(crates),
    history: state.history.concat([previous])
  };
}
export {createGame,stepGame};
