/**
 * 動くボーナス門や追跡系ギミックの状態を管理するDirectorです。
 * クリア不能を作らないよう、必須条件ではなく任意ボーナスとして扱います。
 */
import { traceBeam } from './beamSystem.js';

const keyOf = (cell) => `${cell.x},${cell.y}`;
const getBoard = (stage) => stage?.board ?? { cols: 8, rows: 8 };
const sameCell = (a, b) => Boolean(a && b && a.x === b.x && a.y === b.y);

function uniqueCells(cells) {
  const seen = new Set();
  return cells.filter((cell) => {
    const key = keyOf(cell);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isInside(cell, board) {
  return cell && cell.x >= 0 && cell.y >= 0 && cell.x < board.cols && cell.y < board.rows;
}

/**
 * MovingBoardDirector keeps the board lively without unfairly changing the clear rule.
 *
 * Fairness rule:
 * - The real exit does not move. Reaching the normal exit always clears.
 * - The moving gate is an optional bonus target worth +1 when the beam passes it and clears.
 * - The ghost is a visible comedy target. Avoiding it while clearing gives +1; touching it does not block clear.
 */
export default class MovingBoardDirector {
  constructor() {
    this.goalCandidates = [];
    this.chaserCandidates = [];
    this.goalPeriodMs = 1900;
    this.chaserPeriodMs = 1250;
    this.seed = 0;
  }

  startTurn({ stage, mirrorStates, roundIndex, playerIndex, event }) {
    this.stage = stage;
    this.seed = (roundIndex + 3) * 19 + (playerIndex + 5) * 29 + (event?.id?.length ?? 0) * 11;
    this.goalPeriodMs = event?.id === 'speedBonus' ? 1500 : 1900;
    this.chaserPeriodMs = event?.id === 'feverFinale' ? 1050 : 1250;

    const solutionMirrors = mirrorStates.map((mirror) => ({
      ...mirror,
      type: mirror.solutionType ?? mirror.type,
    }));
    const board = getBoard(stage);
    const solved = traceBeam(stage, solutionMirrors, board);
    const occupied = new Set([
      ...((stage.emitters ?? [stage.emitter]).map(keyOf)),
      ...((stage.goals ?? [stage.goal]).map(keyOf)),
      ...stage.walls.map(keyOf),
      ...stage.portals.map(keyOf),
      ...stage.mirrors.map(keyOf),
    ]);

    const pathCells = uniqueCells(solved.cells).filter((cell) => isInside(cell, board));
    const cleanPathCells = pathCells.filter((cell) => !occupied.has(keyOf(cell)));
    this.goalCandidates = uniqueCells(cleanPathCells.slice(1, -1)).filter((cell) => isInside(cell, board));
    if (!this.goalCandidates.length) this.goalCandidates = cleanPathCells.slice(0, 1);

    const chaserBlocked = new Set([
      ...((stage.emitters ?? [stage.emitter]).map(keyOf)),
      ...((stage.goals ?? [stage.goal]).map(keyOf)),
      ...stage.walls.map(keyOf),
      ...stage.portals.map(keyOf),
    ]);
    const fallback = [];
    for (let y = 0; y < board.rows; y += 1) {
      for (let x = 0; x < board.cols; x += 1) {
        const cell = { x, y };
        if (!chaserBlocked.has(keyOf(cell))) fallback.push(cell);
      }
    }
    this.chaserCandidates = uniqueCells(fallback);
  }

  getTimedIndex(list, now, periodMs, offset = 0) {
    if (!list.length) return -1;
    return (Math.floor(now / periodMs) + this.seed + offset) % list.length;
  }

  getActiveGoal(now) {
    const index = this.getTimedIndex(this.goalCandidates, now, this.goalPeriodMs);
    return index < 0 ? null : this.goalCandidates[index];
  }

  getActiveChaser(now) {
    const index = this.getTimedIndex(this.chaserCandidates, now, this.chaserPeriodMs, 2);
    return index < 0 ? null : this.chaserCandidates[index];
  }

  /** The real goal stays fixed so the player is never robbed by timing. */
  createTraceStage(stage) {
    return stage;
  }

  hasCell(result, target) {
    if (!target || !result?.cells) return false;
    return result.cells.some((cell) => sameCell(cell, target));
  }

  applyDynamicResult({ stage, result, now }) {
    const bonusGate = this.getActiveGoal(now);
    const activeChaser = this.getActiveChaser(now);
    const movingGoal = this.hasCell(result, bonusGate);
    const chaserHit = this.hasCell(result, activeChaser);
    return {
      ...result,
      activeGoal: stage.goal,
      bonusGate,
      activeChaser,
      movingGoal,
      chaserHit,
      ghostAvoided: result.reachedGoal && !chaserHit,
      beamEaten: false,
    };
  }

  getDynamicScore({ result, cleared }) {
    const movingGoal = cleared && Boolean(result?.movingGoal);
    const chaserHit = Boolean(result?.chaserHit);
    const ghostAvoided = cleared && !chaserHit;
    return {
      movingGoal,
      chaserHit,
      ghostAvoided,
      value: (movingGoal ? 1 : 0) + (ghostAvoided ? 1 : 0),
    };
  }

  getLiveBadges(result, now) {
    const chaser = this.getActiveChaser(now);
    const chaserHit = this.hasCell(result, chaser);
    return [
      {
        icon: 'target-door',
        label: result?.movingGoal ? '門 +1' : 'ボーナス門',
        tone: result?.movingGoal ? 'special' : 'normal',
      },
      {
        icon: 'ghost',
        label: chaserHit ? 'おばけ通過' : '回避 +1',
        tone: chaserHit ? 'normal' : 'special',
      },
    ];
  }
}
