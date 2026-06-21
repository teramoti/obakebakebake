import { GRID_SIZE } from '../data/stages.js';
import { traceBeam } from './beamSystem.js';

const VARIANTS = [
  { id: 'normal', label: '通常盤面' },
  { id: 'mirrorX', label: '左右反転' },
  { id: 'mirrorY', label: '上下反転' },
  { id: 'rotate180', label: '180度回転' },
];

const DIR_BY_VARIANT = {
  normal: { up: 'up', down: 'down', left: 'left', right: 'right' },
  mirrorX: { up: 'up', down: 'down', left: 'right', right: 'left' },
  mirrorY: { up: 'down', down: 'up', left: 'left', right: 'right' },
  rotate180: { up: 'down', down: 'up', left: 'right', right: 'left' },
};

function resolveBoard(boardConfig) {
  return {
    cols: Number.isFinite(boardConfig?.cols) ? boardConfig.cols : GRID_SIZE,
    rows: Number.isFinite(boardConfig?.rows) ? boardConfig.rows : GRID_SIZE,
  };
}

function transformCell(cell, variantId, boardConfig) {
  const board = resolveBoard(boardConfig);
  const maxX = board.cols - 1;
  const maxY = board.rows - 1;
  if (variantId === 'mirrorX') return { ...cell, x: maxX - cell.x };
  if (variantId === 'mirrorY') return { ...cell, y: maxY - cell.y };
  if (variantId === 'rotate180') return { ...cell, x: maxX - cell.x, y: maxY - cell.y };
  return { ...cell };
}

function transformDir(dir, variantId) {
  return DIR_BY_VARIANT[variantId]?.[dir] ?? dir;
}

function transformMirrorType(type, variantId) {
  if (variantId === 'mirrorX' || variantId === 'mirrorY') return type === '/' ? '\\' : '/';
  return type;
}

function transformEmitter(emitter, variantId, boardConfig) {
  return {
    ...transformCell(emitter, variantId, boardConfig),
    dir: transformDir(emitter.dir, variantId),
  };
}

function transformMirror(mirror, variantId, boardConfig) {
  return {
    ...transformCell(mirror, variantId, boardConfig),
    type: transformMirrorType(mirror.type, variantId),
    solutionType: transformMirrorType(mirror.solutionType, variantId),
  };
}

function transformPortal(portal, variantId, boardConfig) {
  return {
    ...transformCell(portal, variantId, boardConfig),
    to: transformCell(portal.to, variantId, boardConfig),
  };
}

function flipMirror(mirror) {
  return {
    ...mirror,
    type: mirror.type === '/' ? '\\' : '/',
  };
}

function applyScramble(mirrors, roundIndex, playerIndex) {
  return mirrors.map((mirror, index) => {
    const shouldFlip = ((index + roundIndex + playerIndex) % 3 === 1) || ((index * 2 + playerIndex) % 7 === 3);
    return shouldFlip ? flipMirror(mirror) : mirror;
  });
}

function preventInstantClear(stage, boardConfig) {
  const initialResult = traceBeam(stage, stage.mirrors, boardConfig);
  if (!initialResult.reachedGoal) return stage;

  for (let index = 0; index < stage.mirrors.length; index += 1) {
    const candidateMirrors = stage.mirrors.map((mirror, mirrorIndex) => (mirrorIndex === index ? flipMirror(mirror) : mirror));
    const candidateStage = { ...stage, mirrors: candidateMirrors };
    const candidateResult = traceBeam(candidateStage, candidateMirrors, boardConfig);
    if (!candidateResult.reachedGoal) return candidateStage;
  }

  return stage;
}

export function remixStageForPlayer(stage, roundIndex, playerIndex, boardConfig) {
  const board = resolveBoard(boardConfig);
  const variant = VARIANTS[(roundIndex + playerIndex) % VARIANTS.length];
  const transformedMirrors = stage.mirrors.map((mirror) => transformMirror(mirror, variant.id, board));
  const scrambledMirrors = applyScramble(transformedMirrors, roundIndex, playerIndex);

  const remixStage = {
    ...stage,
    board,
    id: `${stage.id}-r${roundIndex + 1}-p${playerIndex + 1}-${variant.id}`,
    baseStageId: stage.id,
    baseStageName: stage.name,
    name: `${stage.name} REMIX`,
    remixLabel: variant.label,
    emitter: transformEmitter(stage.emitter, variant.id, board),
    goal: transformCell(stage.goal, variant.id, board),
    mirrors: scrambledMirrors,
    crystals: stage.crystals.map((cell) => transformCell(cell, variant.id, board)),
    ghosts: stage.ghosts.map((cell) => transformCell(cell, variant.id, board)),
    walls: stage.walls.map((cell) => transformCell(cell, variant.id, board)),
    portals: stage.portals.map((portal) => transformPortal(portal, variant.id, board)),
  };

  return preventInstantClear(remixStage, board);
}

export function createRoundStageAssignments({ stagePool, roundCount, playerCount, fallbackStages, boardConfig }) {
  const safePool = stagePool.length > 0 ? stagePool : fallbackStages;
  const assignments = [];

  for (let roundIndex = 0; roundIndex < roundCount; roundIndex += 1) {
    const roundStages = [];
    for (let playerIndex = 0; playerIndex < playerCount; playerIndex += 1) {
      const stageIndex = (roundIndex * playerCount + playerIndex) % safePool.length;
      roundStages[playerIndex] = remixStageForPlayer(safePool[stageIndex], roundIndex, playerIndex, boardConfig);
    }
    assignments.push(roundStages);
  }

  return assignments;
}
