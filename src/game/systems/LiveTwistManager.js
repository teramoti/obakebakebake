/**
 * プレイ中に変化する小さなボーナス目標を管理するクラスです。
 * 操作を増やさず、盤面上の狙いどころを作るために使用します。
 */
const CELL_KEY = (cell) => `${cell.x},${cell.y}`;
const getBoard = (stage) => stage?.board ?? { cols: 8, rows: 8 };

/**
 * LiveTwistManager adds moving bonus / danger targets to a turn.
 *
 * The clear rule stays simple: rotate mirrors and connect the light to the goal.
 * These live targets create extra decisions without adding extra controls:
 * - SPOT: route through it and clear for +2.
 * - DANGER: avoid it, or the final beam costs -1.
 * - COMBO: SPOT + crystal route gives +1 more.
 */
export default class LiveTwistManager {
  constructor() {
    this.candidates = [];
    this.seed = 0;
    this.periodMs = 1650;
    this.dangerOffset = 3;
  }

  /** Pick safe cells that are not already occupied by fixed board objects. */
  startTurn({ stage, roundIndex, playerIndex, event }) {
    const blocked = new Set([
      ...((stage.emitters ?? [stage.emitter]).map(CELL_KEY)),
      ...((stage.goals ?? [stage.goal]).map(CELL_KEY)),
      ...stage.walls.map(CELL_KEY),
      ...stage.portals.map(CELL_KEY),
    ]);
    this.candidates = [];
    const board = getBoard(stage);
    for (let y = 0; y < board.rows; y += 1) {
      for (let x = 0; x < board.cols; x += 1) {
        if (!blocked.has(`${x},${y}`)) this.candidates.push({ x, y });
      }
    }
    this.seed = (roundIndex + 1) * 17 + (playerIndex + 1) * 31 + (event?.id?.length ?? 0) * 7;
    this.dangerOffset = 2 + ((roundIndex + playerIndex) % 5);
  }

  getIndex(now, offset = 0) {
    if (!this.candidates.length) return -1;
    return (Math.floor(now / this.periodMs) + this.seed + offset) % this.candidates.length;
  }

  getActiveSpotlight(now) {
    const index = this.getIndex(now);
    return index < 0 ? null : this.candidates[index];
  }

  getActiveDanger(now) {
    const index = this.getIndex(now, this.dangerOffset);
    return index < 0 ? null : this.candidates[index];
  }

  hasCell(result, target) {
    if (!target || !result?.cells) return false;
    return result.cells.some((cell) => cell.x === target.x && cell.y === target.y);
  }

  isSpotlightHit(result, now) {
    return this.hasCell(result, this.getActiveSpotlight(now));
  }

  isDangerHit(result, now) {
    return this.hasCell(result, this.getActiveDanger(now));
  }

  getLiveScore({ result, now, cleared }) {
    const spot = this.isSpotlightHit(result, now);
    const danger = this.isDangerHit(result, now);
    const combo = cleared && spot && !danger && (result?.crystals ?? 0) > 0;
    return {
      spot,
      danger,
      combo,
      value: (cleared && spot ? 2 : 0) + (combo ? 1 : 0) - (danger ? 1 : 0),
    };
  }

  getLiveBonus(args) {
    return this.getLiveScore(args).value;
  }

  getLiveBadges(result, now) {
    const score = this.getLiveScore({ result, now, cleared: true });
    const badges = [];
    badges.push({
      icon: 'ui-spotlight',
      label: score.spot ? 'スポット +2' : 'スポット',
      tone: score.spot ? 'special' : 'normal',
    });
    badges.push({
      icon: 'warning-ghost',
      label: score.danger ? '危険 -1' : '危険回避',
      tone: score.danger ? 'danger' : 'normal',
    });
    if (score.combo) {
      badges.push({ icon: 'beam-spark', label: 'コンボ +1', tone: 'special' });
    }
    return badges;
  }

  getLiveBadge(result, now) {
    return this.getLiveBadges(result, now)[0] ?? null;
  }
}
