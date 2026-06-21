import { traceBeam } from './beamSystem.js';

export const LIGHT_COLOR_HEX = {
  yellow: 0xffe66d,
  cyan: 0x6ee7ff,
  pink: 0xff75d8,
};

const LIGHT_COLOR_LABEL = {
  yellow: '黄',
  cyan: '青',
  pink: '桃',
};

const EXTRA_LIGHT_COLORS = ['cyan', 'pink'];

function cloneCell(cell) {
  return { ...cell };
}

function keyOf(cell) {
  return `${cell.x},${cell.y}`;
}

function mirrorForVerticalTravel(fromY, toY) {
  if (toY > fromY) return '\\';
  if (toY < fromY) return '/';
  return null;
}

function flipMirrorType(type) {
  return type === '/' ? '\\' : '/';
}

function uniqueBoardCellLines(lines, board) {
  return lines.filter((line) => (
    line.from.x >= 0 && line.from.y >= 0 && line.from.x < board.cols && line.from.y < board.rows
    && line.to.x >= 0 && line.to.y >= 0 && line.to.x < board.cols && line.to.y < board.rows
  ));
}

function solutionTrace(stage, board) {
  const solutionMirrors = stage.mirrors.map((mirror) => ({ ...mirror, type: mirror.solutionType ?? mirror.type }));
  return traceBeam(stage, solutionMirrors, board);
}

function solvedWithStage(stage, board) {
  const solutionMirrors = stage.mirrors.map((mirror) => ({ ...mirror, type: mirror.solutionType ?? mirror.type }));
  return traceBeam(stage, solutionMirrors, board).reachedGoal;
}

function initialClear(stage, board) {
  return traceBeam(stage, stage.mirrors, board).reachedGoal;
}

function occupiedCells(stage) {
  const occupied = new Set();
  [
    ...(stage.emitters ?? []),
    ...(stage.goals ?? []),
    ...(stage.mirrors ?? []),
    ...(stage.walls ?? []),
    ...(stage.portals ?? []),
    ...((stage.portals ?? []).map((portal) => portal.to)),
  ].forEach((cell) => occupied.add(keyOf(cell)));
  return occupied;
}

function pathCellsForRoute(route) {
  const cells = [];
  const minY = Math.min(route.startY, route.goalY);
  const maxY = Math.max(route.startY, route.goalY);
  for (let x = 0; x <= route.turnX; x += 1) cells.push(`${x},${route.startY}`);
  for (let y = minY; y <= maxY; y += 1) cells.push(`${route.turnX},${y}`);
  for (let x = route.turnX; x < route.board.cols; x += 1) cells.push(`${x},${route.goalY}`);
  return cells;
}

function collidesWithBlockedPath(route, stage) {
  const blockers = new Set([
    ...(stage.walls ?? []).map(keyOf),
    ...(stage.portals ?? []).map(keyOf),
    ...((stage.portals ?? []).map((portal) => keyOf(portal.to))),
  ]);
  return pathCellsForRoute(route).some((key) => blockers.has(key));
}

function preferredRows(count, rows) {
  if (count <= 1) return [Math.max(1, Math.floor(rows / 2))];
  if (count === 2) return [Math.max(1, Math.floor(rows * 0.28)), Math.min(rows - 2, Math.floor(rows * 0.72))];
  return [1, Math.floor(rows / 2), rows - 2].map((row) => Math.max(1, Math.min(rows - 2, row)));
}

function candidateRows(preferred, rows) {
  const result = [];
  const seen = new Set();
  const add = (row) => {
    const safe = Math.max(1, Math.min(rows - 2, row));
    if (!seen.has(safe)) {
      seen.add(safe);
      result.push(safe);
    }
  };
  preferred.forEach(add);
  for (let offset = 1; offset < rows; offset += 1) {
    preferred.forEach((row) => {
      add(row - offset);
      add(row + offset);
    });
  }
  return result;
}

function makeRouteStage(stage, board, sourceIndex, color, startY, goalY, turnX) {
  const solutionType = mirrorForVerticalTravel(startY, goalY);
  if (!solutionType) return null;

  const id = `light-${sourceIndex}`;
  const route = { startY, goalY, turnX, board };
  const emitter = {
    x: 0,
    y: startY,
    dir: 'right',
    id,
    color,
    label: LIGHT_COLOR_LABEL[color] ?? '',
  };
  const goal = {
    x: board.cols - 1,
    y: goalY,
    id: `goal-${sourceIndex}`,
    color,
    label: LIGHT_COLOR_LABEL[color] ?? '',
  };
  const routeMirrors = [
    {
      x: turnX,
      y: startY,
      type: flipMirrorType(solutionType),
      solutionType,
      routeId: id,
    },
    {
      x: turnX,
      y: goalY,
      type: solutionType,
      solutionType,
      routeId: id,
    },
  ];

  if (collidesWithBlockedPath(route, stage)) return null;

  const existing = occupiedCells(stage);
  const routeKeys = [keyOf(emitter), keyOf(goal), ...routeMirrors.map(keyOf)];
  if (new Set(routeKeys).size !== routeKeys.length) return null;
  if (routeKeys.some((key) => existing.has(key))) return null;

  const candidate = {
    ...stage,
    emitters: [...stage.emitters, emitter],
    goals: [...stage.goals, goal],
    mirrors: [...stage.mirrors, ...routeMirrors],
  };

  if (!solvedWithStage(candidate, board)) return null;
  if (initialClear(candidate, board)) return null;
  return candidate;
}

function addLeftEdgeColoredLight(stage, board, sourceIndex, color, targetPreferredRow) {
  const startRowOptions = candidateRows([targetPreferredRow], board.rows);
  const goalPreference = [
    targetPreferredRow + 2,
    targetPreferredRow - 2,
    targetPreferredRow + 3,
    targetPreferredRow - 3,
    targetPreferredRow + 1,
    targetPreferredRow - 1,
  ];
  const goalRowOptions = candidateRows(goalPreference, board.rows);
  const turnColumns = [];
  for (let x = 2; x <= board.cols - 3; x += 1) turnColumns.push(x);

  for (const startY of startRowOptions) {
    for (const goalY of goalRowOptions) {
      if (goalY === startY) continue;
      for (const turnX of turnColumns) {
        const candidate = makeRouteStage(stage, board, sourceIndex, color, startY, goalY, turnX);
        if (candidate) return candidate;
      }
    }
  }
  return stage;
}

function chooseSplitter(stage, board) {
  const trace = solutionTrace(stage, board);
  const lines = uniqueBoardCellLines(trace.lines, board);
  if (lines.length < 4) return [];
  const candidate = lines[Math.floor(lines.length * 0.45)]?.to;
  if (!candidate) return [];
  const occupiedByMirror = stage.mirrors.some((mirror) => mirror.x === candidate.x && mirror.y === candidate.y);
  const occupiedByWall = stage.walls.some((wall) => wall.x === candidate.x && wall.y === candidate.y);
  const occupiedByEmitter = stage.emitters?.some((emitter) => emitter.x === candidate.x && emitter.y === candidate.y);
  const occupiedByGoal = stage.goals?.some((goal) => goal.x === candidate.x && goal.y === candidate.y);
  if (occupiedByMirror || occupiedByWall || occupiedByEmitter || occupiedByGoal) return [];
  return [{ ...candidate, id: 'split-1' }];
}

function markFixedMirrors(stage, difficultyId) {
  const lockCount = difficultyId === 'hard' ? 2 : (difficultyId === 'normal' ? 1 : 0);
  if (lockCount <= 0) return stage.mirrors;

  // Fixed mirrors are placed in their solution direction, so they work as
  // readable puzzle anchors instead of unfair blockers.
  const avoidFirstAndLast = stage.mirrors.slice(1, Math.max(1, stage.mirrors.length - 1));
  const chosen = new Set(
    avoidFirstAndLast
      .map((mirror, index) => ({ mirror, index: index + 1 }))
      .filter(({ mirror }) => mirror.solutionType)
      .slice(0, lockCount)
      .map(({ index }) => index),
  );

  return stage.mirrors.map((mirror, index) => {
    if (!chosen.has(index)) return mirror;
    return {
      ...mirror,
      type: mirror.solutionType,
      locked: true,
      fixedLabel: '固定',
    };
  });
}

function preventEnhancedInstantClear(stage, board) {
  if (!initialClear(stage, board)) return stage;
  for (let index = stage.mirrors.length - 1; index >= 0; index -= 1) {
    const mirror = stage.mirrors[index];
    if (mirror.locked) continue;
    const candidateMirrors = stage.mirrors.map((item, mirrorIndex) => (
      mirrorIndex === index ? { ...item, type: flipMirrorType(item.type) } : item
    ));
    const candidate = { ...stage, mirrors: candidateMirrors };
    if (solvedWithStage(candidate, board) && !initialClear(candidate, board)) return candidate;
  }
  return stage;
}

/**
 * Adds puzzle depth without adding new controls.
 * EASY keeps one light. NORMAL/HARD add color lights from the left edge.
 * Extra lights are generated as solvable routes and checked so no turn starts solved.
 */
export function enhanceStageForDifficulty(stage, difficultyId, board) {
  let enhanced = {
    ...stage,
    emitter: { ...stage.emitter, id: 'light-1', color: 'yellow', label: '黄' },
    goal: { ...stage.goal, id: 'goal-1', color: 'yellow', label: '黄' },
    mirrors: stage.mirrors.map((mirror) => ({ ...mirror })),
    crystals: stage.crystals.map(cloneCell),
    ghosts: stage.ghosts.map(cloneCell),
    walls: stage.walls.map(cloneCell),
    portals: stage.portals.map((portal) => ({ ...portal, to: cloneCell(portal.to) })),
    splitters: [],
  };

  enhanced.emitters = [enhanced.emitter];
  enhanced.goals = [enhanced.goal];
  enhanced.mirrors = markFixedMirrors(enhanced, difficultyId);

  const extraCount = difficultyId === 'hard' ? 2 : (difficultyId === 'normal' ? 1 : 0);
  const rows = preferredRows(extraCount + 1, board.rows).slice(1);
  for (let index = 0; index < extraCount; index += 1) {
    enhanced = addLeftEdgeColoredLight(enhanced, board, index + 2, EXTRA_LIGHT_COLORS[index], rows[index] ?? Math.floor(board.rows / 2));
  }

  if (difficultyId === 'hard') {
    enhanced.splitters = chooseSplitter(enhanced, board);
  }

  enhanced = preventEnhancedInstantClear(enhanced, board);
  enhanced.puzzleRule = {
    coloredLights: enhanced.emitters.length,
    requiredGoals: enhanced.goals.length,
    splitters: enhanced.splitters.length,
    fixedMirrors: enhanced.mirrors.filter((mirror) => mirror.locked).length,
  };

  return enhanced;
}
