/**
 * 各ターンの回転回数上限を管理するクラスです。
 * 時間制限だけでなくMOVE制限を入れることで、短時間で考えるパズル性を作ります。
 */
export default class MoveLimitManager {
  // 難易度ごとの基本MOVE補正を保持します。
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
