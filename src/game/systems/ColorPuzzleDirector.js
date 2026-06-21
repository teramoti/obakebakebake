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

function cloneCell(cell) {
  return { ...cell };
}

function dirFromLine(line) {
  const dx = line.to.x - line.from.x;
  const dy = line.to.y - line.from.y;
  if (dx > 0) return 'right';
  if (dx < 0) return 'left';
  if (dy > 0) return 'down';
  return 'up';
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

function buildExtraLightFromSolution({ stage, board, sourceIndex, color, emitterLineIndex, goalLineIndex }) {
  const trace = solutionTrace(stage, board);
  const lines = uniqueBoardCellLines(trace.lines, board);
  if (lines.length < Math.max(emitterLineIndex, goalLineIndex) + 1) return null;

  const emitterLine = lines[Math.min(emitterLineIndex, lines.length - 2)];
  const goalLine = lines[Math.min(goalLineIndex, lines.length - 1)];
  if (!emitterLine || !goalLine) return null;

  return {
    emitter: {
      ...cloneCell(emitterLine.from),
      dir: dirFromLine(emitterLine),
      id: `light-${sourceIndex}`,
      color,
      label: LIGHT_COLOR_LABEL[color] ?? '',
    },
    goal: {
      ...cloneCell(goalLine.to),
      id: `goal-${sourceIndex}`,
      color,
      label: LIGHT_COLOR_LABEL[color] ?? '',
    },
  };
}


function solvedWithStage(stage, board) {
  const solutionMirrors = stage.mirrors.map((mirror) => ({ ...mirror, type: mirror.solutionType ?? mirror.type }));
  return traceBeam(stage, solutionMirrors, board).reachedGoal;
}

function tryAddColoredLight(stage, board, sourceIndex, color, candidates) {
  for (const [emitterLineIndex, goalLineIndex] of candidates) {
    const extra = buildExtraLightFromSolution({ stage, board, sourceIndex, color, emitterLineIndex, goalLineIndex });
    if (!extra) continue;
    const candidate = {
      ...stage,
      emitters: [...stage.emitters, extra.emitter],
      goals: [...stage.goals, extra.goal],
    };
    if (solvedWithStage(candidate, board)) return candidate;
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
  if (occupiedByMirror || occupiedByWall) return [];
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

/**
 * Adds puzzle depth without adding new controls.
 * EASY keeps one light. NORMAL adds a second colored light/goal.
 * HARD adds color targets and one splitter candidate on the solved route.
 */
export function enhanceStageForDifficulty(stage, difficultyId, board) {
  const enhanced = {
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

  enhanced.mirrors = markFixedMirrors(enhanced, difficultyId);
  enhanced.emitters = [enhanced.emitter];
  enhanced.goals = [enhanced.goal];

  if (difficultyId === 'normal' || difficultyId === 'hard') {
    Object.assign(enhanced, tryAddColoredLight(enhanced, board, 2, 'cyan', [
      [1, 3], [0, 2], [2, 4], [1, 5], [3, 6],
    ]));
  }

  if (difficultyId === 'hard') {
    Object.assign(enhanced, tryAddColoredLight(enhanced, board, 3, 'pink', [
      [2, 5], [1, 4], [3, 7], [0, 3], [4, 8],
    ]));
    enhanced.splitters = chooseSplitter(enhanced, board);
  }

  enhanced.puzzleRule = {
    coloredLights: enhanced.emitters.length,
    requiredGoals: enhanced.goals.length,
    splitters: enhanced.splitters.length,
    fixedMirrors: enhanced.mirrors.filter((mirror) => mirror.locked).length,
  };

  return enhanced;
}
