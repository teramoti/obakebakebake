/**
 * 光線の進行を計算するコアロジックです。
 * 鏡反射、壁、ポータル、色ゴール、複数ライトを判定し、描画とスコアが使う結果を返します。
 */
const DIRS = {
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};

const REFLECT = {
  '/': {
    right: 'up',
    up: 'right',
    left: 'down',
    down: 'left',
  },
  '\\': {
    right: 'down',
    down: 'right',
    left: 'up',
    up: 'left',
  },
};

const SPLIT = {
  right: ['right', 'up', 'down'],
  left: ['left', 'up', 'down'],
  up: ['up', 'left', 'right'],
  down: ['down', 'left', 'right'],
};

function keyOf(point) {
  return `${point.x},${point.y}`;
}

function stateKey(x, y, dir, color, sourceId) {
  return `${x},${y},${dir},${color},${sourceId}`;
}

function normalizeGrid(gridSize, stage) {
  if (typeof gridSize === 'number') return { cols: gridSize, rows: gridSize };
  const source = gridSize ?? stage?.board ?? {};
  return {
    cols: Number.isFinite(source.cols) ? source.cols : 8,
    rows: Number.isFinite(source.rows) ? source.rows : 8,
  };
}

function normalizeEmitters(stage) {
  const emitters = Array.isArray(stage.emitters) && stage.emitters.length > 0
    ? stage.emitters
    : [{ ...stage.emitter, id: 'light-1', color: stage.emitter?.color ?? 'yellow' }];

  return emitters.map((emitter, index) => ({
    ...emitter,
    id: emitter.id ?? `light-${index + 1}`,
    color: emitter.color ?? 'yellow',
  }));
}

function normalizeGoals(stage) {
  const goals = Array.isArray(stage.goals) && stage.goals.length > 0
    ? stage.goals
    : [{ ...stage.goal, id: 'goal-1', color: stage.goal?.color ?? 'yellow' }];

  return goals.map((goal, index) => ({
    ...goal,
    id: goal.id ?? `goal-${index + 1}`,
    color: goal.color ?? 'yellow',
  }));
}

function isMatchingGoal(goal, color) {
  return !goal.color || goal.color === color;
}

export function traceBeam(stage, mirrorStates, gridSize) {
  const grid = normalizeGrid(gridSize, stage);
  const emitters = normalizeEmitters(stage);
  const goals = normalizeGoals(stage);
  const cells = [];
  const lines = [];
  const crystals = new Set();
  const ghosts = new Set();
  const matchedEmitters = new Set();
  const matchedGoals = new Set();
  const wrongGoals = new Set();
  const wrongGoalCells = new Map();
  let usedPortal = false;
  let usedSplitter = false;
  let blockedByWall = false;
  let looped = false;
  const visitedStates = new Set();
  const walls = new Set((stage.walls ?? []).map(keyOf));
  const crystalCells = new Set((stage.crystals ?? []).map(keyOf));
  const ghostCells = new Set((stage.ghosts ?? []).map(keyOf));
  const portalByCell = new Map((stage.portals ?? []).map((portal) => [keyOf(portal), portal]));
  const splitterByCell = new Map((stage.splitters ?? []).map((splitter) => [keyOf(splitter), splitter]));
  const mirrorByCell = new Map(mirrorStates.map((mirror) => [keyOf(mirror), mirror]));
  const goalsByCell = new Map();

  goals.forEach((goal) => {
    const key = keyOf(goal);
    const list = goalsByCell.get(key) ?? [];
    list.push(goal);
    goalsByCell.set(key, list);
  });

  const queue = emitters.map((emitter) => ({
    x: emitter.x,
    y: emitter.y,
    dir: emitter.dir,
    color: emitter.color,
    sourceId: emitter.id,
  }));
  const maxSteps = Math.max(64, grid.cols * grid.rows * 10 * Math.max(1, emitters.length));
  let stepCount = 0;

  while (queue.length > 0 && stepCount < maxSteps) {
    const beam = queue.shift();
    let { x, y, dir, color, sourceId } = beam;

    for (let step = 0; step < grid.cols * grid.rows * 5; step += 1) {
      stepCount += 1;
      const vector = DIRS[dir];
      const nextX = x + vector.x;
      const nextY = y + vector.y;

      lines.push({ from: { x, y }, to: { x: nextX, y: nextY }, color, sourceId });

      x = nextX;
      y = nextY;

      if (x < 0 || y < 0 || x >= grid.cols || y >= grid.rows) break;

      const state = stateKey(x, y, dir, color, sourceId);
      if (visitedStates.has(state)) {
        looped = true;
        break;
      }
      visitedStates.add(state);
      cells.push({ x, y, color, sourceId });

      const cellKey = `${x},${y}`;

      if (walls.has(cellKey)) {
        blockedByWall = true;
        break;
      }

      const goalsHere = goalsByCell.get(cellKey) ?? [];
      if (goalsHere.length > 0) {
        const match = goalsHere.find((goal) => isMatchingGoal(goal, color));
        if (match) {
          matchedEmitters.add(sourceId);
          matchedGoals.add(match.id);
          break;
        }
        wrongGoals.add(`${sourceId}:${cellKey}`);
        wrongGoalCells.set(cellKey, { x, y, color, sourceId });
      }

      if (crystalCells.has(cellKey)) crystals.add(cellKey);
      if (ghostCells.has(cellKey)) ghosts.add(cellKey);

      const portal = portalByCell.get(cellKey);
      if (portal) {
        usedPortal = true;
        x = portal.to.x;
        y = portal.to.y;
        cells.push({ x, y, color, sourceId });
      }

      const splitter = splitterByCell.get(`${x},${y}`);
      if (splitter) {
        usedSplitter = true;
        const nextDirs = SPLIT[dir] ?? [dir];
        nextDirs.slice(1).forEach((branchDir) => {
          queue.push({ x, y, dir: branchDir, color, sourceId });
        });
        dir = nextDirs[0];
      }

      const mirror = mirrorByCell.get(`${x},${y}`);
      if (mirror) {
        dir = REFLECT[mirror.type][dir];
      }
    }
  }

  if (stepCount >= maxSteps) looped = true;

  const requiredEmitters = emitters.map((emitter) => emitter.id);
  const reachedGoal = requiredEmitters.every((id) => matchedEmitters.has(id));

  return {
    lines,
    cells,
    reachedGoal,
    crystals: crystals.size,
    ghosts: ghosts.size,
    usedPortal,
    usedSplitter,
    blockedByWall,
    looped,
    emitters,
    goals,
    matchedEmitters: matchedEmitters.size,
    matchedGoals: matchedGoals.size,
    matchedGoalIds: [...matchedGoals],
    wrongGoals: wrongGoals.size,
    wrongGoalCells: [...wrongGoalCells.values()],
    requiredGoals: goals.length,
    requiredEmitters: emitters.length,
  };
}

export function cloneMirrors(stage) {
  return stage.mirrors.map((mirror) => ({ ...mirror }));
}

export function toggleMirrorType(type) {
  return type === '/' ? '\\' : '/';
}
