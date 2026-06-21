/**
 * MoveLimitManager converts each stage's par value into a visible move limit.
 * Each mirror rotation consumes 1 move, and the turn ends when moves reach 0.
 */
export default class MoveLimitManager {
  constructor(difficultyId) {
    this.difficultyId = difficultyId;
  }

  /** Extra moves keep EASY forgiving and HARD tense. */
  getDifficultyExtra() {
    const table = {
      easy: 6,
      normal: 5,
      hard: 4,
    };
    return table[this.difficultyId] ?? table.normal;
  }

  /** Return the turn's max mirror rotations. eventMoveBonus is supplied by GimmickDirector. */
  getMaxMoves(stage, eventMoveBonus = 0) {
    const par = Number.isFinite(stage.par) ? stage.par : stage.mirrors.length;
    return Math.max(4, par + this.getDifficultyExtra() + eventMoveBonus);
  }

  /** Remaining moves displayed in the HUD. */
  getMovesLeft(rotations, maxMoves) {
    return Math.max(0, maxMoves - rotations);
  }

  /** True when the player can no longer rotate mirrors this turn. */
  isOutOfMoves(rotations, maxMoves) {
    return this.getMovesLeft(rotations, maxMoves) <= 0;
  }
}
