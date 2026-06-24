/**
 * 各ターンの得点をプレイヤー別に蓄積する台帳クラスです。
 * ラウンド別点数と合計点を分けて保持し、Result連携時の情報源にします。
 */
export default class ScoreLedger {
  // プレイヤー配列へスコア蓄積用フィールドを作ります。
  constructor(players) {
    this.players = players;
  }

  /** Apply one finished turn to the target player's cumulative result. */
  applyTurn({
    playerIndex,
    stage,
    roundIndex,
    resultContext,
    scoring,
    cleared,
    rotations,
    maxMoves,
    remaining,
    event,
  }) {
    const result = resultContext.scoreResult;
    const player = this.players[playerIndex];
    player.totalScore += scoring.score;
    player.clears += cleared ? 1 : 0;
    player.perfects += scoring.isPerfect ? 1 : 0;
    player.missions += scoring.mission ? 1 : 0;
    player.crystals += result.crystals;
    player.ghosts += result.ghosts;
    player.rotations += rotations;
    player.movesLeft += scoring.movesLeft;
    player.eventBonus += scoring.breakdown.event;
    player.liveBonus += scoring.breakdown.live ?? 0;
    player.ruleBonus += scoring.breakdown.rule ?? 0;
    player.stages.push({
      round: roundIndex,
      stageId: stage.id,
      stageName: stage.name,
      baseStageName: stage.baseStageName,
      remixLabel: stage.remixLabel,
      score: scoring.score,
      cleared,
      ...scoring,
      crystals: result.crystals,
      ghosts: result.ghosts,
      matchedEmitters: result.matchedEmitters ?? 1,
      requiredEmitters: result.requiredEmitters ?? 1,
      usedSplitter: Boolean(result.usedSplitter),
      rotations,
      maxMoves,
      movesLeft: scoring.movesLeft,
      remaining,
      eventId: event?.id,
      eventLabel: event?.shortLabel,
      breakdown: scoring.breakdown,
      routeSnapshot: resultContext.snapshot,
    });
    return player;
  }

  /** Ranking uses the carried total score, then clear count as a tie breaker. */
  getRanking() {
    return [...this.players].sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return b.clears - a.clears;
    });
  }

  /** Compact summary for the result screen. */
  getSummary(roundCount) {
    const totalScore = this.players.reduce((sum, player) => sum + player.totalScore, 0);
    return {
      averageScore: Math.round((totalScore / this.players.length) * 10) / 10,
      totalClears: this.players.reduce((sum, player) => sum + player.clears, 0),
      totalMissions: this.players.reduce((sum, player) => sum + player.missions, 0),
      totalMovesLeft: this.players.reduce((sum, player) => sum + player.movesLeft, 0),
      roundCount,
    };
  }
}
