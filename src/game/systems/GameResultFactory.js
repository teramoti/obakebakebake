/**
 * Phaser内部のプレイヤー状態からReactへ返すGameResultを作るFactoryです。
 * ResultScreenや外部メインゲームが必要とする順位・得点・内訳をここで整形します。
 */
export function createGameResultPayload({ scoreLedger, settings, roundCount }) {
  const ranking = scoreLedger.getRanking();
  return {
    results: ranking.map((player, index) => ({
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
      stages: player.stages,
    })),
    settings,
    roundCount,
    summary: scoreLedger.getSummary(roundCount),
  };
}
