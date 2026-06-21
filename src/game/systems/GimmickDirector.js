/**
 * ラウンドイベントに応じたMOVE補正などを決めるDirectorです。
 * ルールの変化をここに寄せ、Scene本体がイベントごとの条件分岐で膨らまないようにします。
 */
export default class GimmickDirector {
  constructor(event) {
    this.event = event;
  }

  /** Round events slightly change the move budget to make modes feel different. */
  getMoveBonus() {
    if (!this.event) return 0;
    const table = {
      crystalRush: 1,
      speedBonus: -1,
      cleanBonus: 0,
      perfectShow: -1,
      comebackLight: 1,
      feverFinale: 0,
    };
    return table[this.event.id] ?? 0;
  }

  /** One short event tip for intro screens. */
  getEventTip() {
    if (!this.event) return '通常ルール';
    const table = {
      crystalRush: '水晶が大事',
      speedBonus: '早さが大事',
      cleanBonus: 'おばけ回避',
      perfectShow: '少ない回転',
      comebackLight: '逆転チャンス',
      feverFinale: '終盤ボーナス',
    };
    return table[this.event.id] ?? this.event.shortLabel ?? 'イベント';
  }

  /** Gimmick status displayed during play. Keep labels short to avoid UI clipping. */
  getLiveBadges({ result, movesLeft, maxMoves }) {
    const badges = [];
    if (!result) return badges;

    if (result.reachedGoal) badges.push({ icon: 'target-door', label: 'ゴール', tone: 'good' });
    if (result.crystals > 0) badges.push({ icon: 'crystal', label: `水晶 +${result.crystals}`, tone: 'good' });
    if (result.usedPortal) badges.push({ icon: 'portal', label: 'ワープ', tone: 'special' });
    if (result.ghosts > 0) badges.push({ icon: 'ghost', label: `おばけ -${result.ghosts}`, tone: 'danger' });
    if (result.blockedByWall) badges.push({ icon: 'wall', label: '壁で停止', tone: 'danger' });
    if (result.looped) badges.push({ icon: 'warning-ghost', label: 'ループ', tone: 'danger' });
    if (movesLeft <= Math.max(1, Math.floor(maxMoves * 0.28))) badges.push({ icon: 'timer-bell', label: '回数注意', tone: 'danger' });

    if (badges.length === 0) badges.push({ icon: 'beam-spark', label: '光を接続', tone: 'normal' });
    return badges.slice(0, 4);
  }
}
