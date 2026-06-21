/**
 * GameResultFactory converts Phaser-side player ledgers into the React/App result payload.
 * GameManager.ts passes this payload back to the host screen after all turns finish.
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
