/**
 * 1ターン分の得点計算を担当します。
 * CLEAR、MISSION、水晶、色ライト、ボーナス門、MOVE残数などを小さい整数点として集計します。
 */
export function checkMission({ stage, result, rotations, remaining, elapsed, stageSeconds, isPerfect }) {
  if (stage.missionType === 'crystals') return result.crystals >= Math.min(2, stage.crystals.length);
  if (stage.missionType === 'portal') return result.usedPortal;
  if (stage.missionType === 'noGhost') return result.ghosts === 0;
  if (stage.missionType === 'lowRotate') return rotations <= stage.par;
  if (stage.missionType === 'speed') return remaining >= stageSeconds * 0.35;
  if (stage.missionType === 'perfect') return isPerfect;
  return elapsed <= stageSeconds;
}

function getEventPoint({ event, cleared, result, remaining, stageSeconds, isPerfect, rankIndex }) {
  if (!cleared || !event) return 0;
  if (event.id === 'crystalRush') return result.crystals > 0 ? 1 : 0;
  if (event.id === 'speedBonus') return remaining >= stageSeconds * 0.35 ? 1 : 0;
  if (event.id === 'cleanBonus') return result.ghosts === 0 ? 1 : 0;
  if (event.id === 'perfectShow') return isPerfect ? 1 : 0;
  if (event.id === 'comebackLight') return Math.min(2, Math.max(0, rankIndex));
  if (event.id === 'finalSprint') return remaining >= stageSeconds * 0.45 ? 2 : 0;
  return 0;
}

/**
 * 1ターンの上限目安です。
 * 実際の動くボーナスは配置やタイミングに左右されるため、HUDでは「目安」として表示します。
 */
export function estimateMaxScore({ stage, event, rankIndex = 0 }) {
  const emitterCount = Math.max(1, stage.emitters?.length ?? 1);
  const clear = 2;
  const time = 1;
  const move = 1;
  const crystals = stage.crystals?.length ?? 0;
  const mission = 2;
  const perfect = 2;
  const color = Math.max(0, emitterCount - 1);
  const split = stage.splitters?.length ? 1 : 0;
  const live = 4; // スポット+2、回避+1、コンボ+1の最大目安です。
  const rule = 1;
  const eventPoint = event?.id === 'comebackLight'
    ? Math.min(2, Math.max(0, rankIndex))
    : (event?.id ? (event.id === 'finalSprint' ? 2 : 1) : 0);
  return clear + time + move + crystals + mission + perfect + color + split + live + rule + eventPoint;
}

/**
 * Small integer scoring.
 * 操作は鏡クリックだけにして、最終的な光ルートから得点を決めます。
 * パズルでは早く解けた方が有利になるよう、終盤待ちの追加点は入れません。
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
  roundRuleBonus = 0,
}) {
  const movesLeft = Math.max(0, maxMoves - rotations);
  const isPerfect = cleared && result.crystals === stage.crystals.length && result.ghosts === 0 && rotations <= stage.par;
  const mission = cleared && checkMission({ stage, result, rotations, remaining, elapsed, stageSeconds, isPerfect });
  const eventPoint = getEventPoint({ event, cleared, result, remaining, stageSeconds, isPerfect, rankIndex });

  const breakdown = {
    clear: cleared ? 2 : 0,
    time: cleared && remaining >= stageSeconds * 0.35 ? 1 : 0,
    move: cleared && rotations <= stage.par ? 1 : 0,
    crystals: result.crystals,
    mission: mission ? 2 : 0,
    perfect: isPerfect ? 2 : 0,
    event: eventPoint,
    live: liveBonus,
    rule: roundRuleBonus,
    color: cleared ? Math.max(0, (result.matchedEmitters ?? 1) - 1) : 0,
    split: cleared && result.usedSplitter ? 1 : 0,
    ghosts: -result.ghosts,
  };

  const score = Object.values(breakdown).reduce((sum, value) => sum + value, 0);

  return {
    score: Math.max(0, score),
    isPerfect,
    mission,
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
    ruleBonus: 0,
    stages: [],
  };
}
