/**
 * 1ターン分の得点計算を担当します。
 * CLEAR、MISSION、水晶、色ライト、ボーナス門、MOVE残数などを小さい整数点として集計します。
 */
export function checkMission({ stage, result, rotations, elapsed, stageSeconds, isPerfect }) {
  if (stage.missionType === 'crystals') return result.crystals >= Math.min(2, stage.crystals.length);
  if (stage.missionType === 'portal') return result.usedPortal;
  if (stage.missionType === 'noGhost') return result.ghosts === 0;
  if (stage.missionType === 'lowRotate') return rotations <= stage.par;
  if (stage.missionType === 'fever') return elapsed >= stageSeconds - Math.min(8, Math.floor(stageSeconds * 0.45));
  if (stage.missionType === 'perfect') return isPerfect;
  return false;
}

function getEventPoint({ event, cleared, result, remaining, stageSeconds, isPerfect, rankIndex, fever }) {
  if (!cleared || !event) return 0;
  if (event.id === 'crystalRush') return result.crystals > 0 ? 1 : 0;
  if (event.id === 'speedBonus') return remaining >= stageSeconds * 0.35 ? 1 : 0;
  if (event.id === 'cleanBonus') return result.ghosts === 0 ? 1 : 0;
  if (event.id === 'perfectShow') return isPerfect ? 1 : 0;
  if (event.id === 'comebackLight') return Math.min(2, Math.max(0, rankIndex));
  if (event.id === 'feverFinale') return fever ? 2 : 0;
  return 0;
}

/**
 * Small integer scoring.
 * This build keeps one clear control: click mirrors only, then score the final beam plus fair optional board bonuses.
 * Crystals, ghosts, moving spotlights, danger and combo are automatic route results.
 */
export function calculateScore({
  stage,
  result,
  rotations,
  remaining,
  elapsed,
  stageSeconds,
  cleared,
  event,
  rankIndex = 0,
  maxMoves = 0,
  liveBonus = 0,
}) {
  const movesLeft = Math.max(0, maxMoves - rotations);
  const isPerfect = cleared && result.crystals === stage.crystals.length && result.ghosts === 0 && rotations <= stage.par;
  const mission = cleared && checkMission({ stage, result, rotations, elapsed, stageSeconds, isPerfect });
  const feverWindow = Math.min(8, Math.max(3, Math.floor(stageSeconds * 0.42)));
  const fever = cleared && remaining <= feverWindow;
  const eventPoint = getEventPoint({ event, cleared, result, remaining, stageSeconds, isPerfect, rankIndex, fever });

  const breakdown = {
    clear: cleared ? 2 : 0,
    time: cleared && remaining >= stageSeconds * 0.35 ? 1 : 0,
    move: cleared && rotations <= stage.par ? 1 : 0,
    crystals: result.crystals,
    mission: mission ? 2 : 0,
    perfect: isPerfect ? 2 : 0,
    fever: fever ? 1 : 0,
    event: eventPoint,
    live: liveBonus,
    color: cleared ? Math.max(0, (result.matchedEmitters ?? 1) - 1) : 0,
    split: cleared && result.usedSplitter ? 1 : 0,
    ghosts: -result.ghosts,
  };

  const score = Object.values(breakdown).reduce((sum, value) => sum + value, 0);

  return {
    score: Math.max(0, score),
    isPerfect,
    mission,
    fever,
    breakdown,
    eventLabel: event?.shortLabel ?? '',
    movesLeft,
  };
}

export function createEmptyPlayer(index) {
  return {
    index,
    totalScore: 0,
    clears: 0,
    perfects: 0,
    missions: 0,
    crystals: 0,
    ghosts: 0,
    rotations: 0,
    movesLeft: 0,
    eventBonus: 0,
    liveBonus: 0,
    stages: [],
  };
}
