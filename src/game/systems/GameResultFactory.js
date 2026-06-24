/**
 * Phaser内部のプレイヤー状態からReactへ返すGameResultを作るFactoryです。
 * ResultScreenや外部メインゲームが必要とする順位・得点・勝因をここで整形します。
 */

function sumBreakdown(player, key) {
  return player.stages.reduce((sum, stage) => sum + (stage.breakdown?.[key] ?? 0), 0);
}

function bestRound(player) {
  return player.stages.reduce((best, stage) => {
    if (!best || stage.score > best.score) return stage;
    return best;
  }, null);
}

function createWinReason(player) {
  const totals = [
    { label: '色合わせ', value: sumBreakdown(player, 'color') },
    { label: '狙い達成', value: sumBreakdown(player, 'rule') },
    { label: '省MOVE', value: sumBreakdown(player, 'move') },
    { label: '分岐', value: sumBreakdown(player, 'split') },
    { label: '小ボーナス', value: sumBreakdown(player, 'live') },
  ].sort((a, b) => b.value - a.value);

  const top = totals[0];
  if (top && top.value > 0) return top.label;
  if (player.clears > 0) return 'CLEAR数';
  return '粘り';
}

function createPlayerResult(player, index) {
  const best = bestRound(player);
  return {
    player: player.index + 1,
    playerIndex: player.index,
    rank: index + 1,
    score: player.totalScore,
    clears: player.clears,
    perfects: player.perfects,
    missions: player.missions,
    crystals: player.crystals,
    ghosts: player.ghosts,
    rotations: player.rotations,
    movesLeft: player.movesLeft,
    winReason: createWinReason(player),
    bestRound: best ? {
      round: best.round + 1,
      score: best.score,
      cleared: best.cleared,
    } : null,
    stages: player.stages,
  };
}

export function createGameResultPayload({ scoreLedger, settings, roundCount }) {
  const ranking = scoreLedger.getRanking();
  return {
    results: ranking.map(createPlayerResult),
    settings,
    roundCount,
    summary: scoreLedger.getSummary(roundCount),
  };
}
