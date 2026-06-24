/**
 * 3ラウンド固定の中で、各ラウンドの勝ち筋を変えるDirectorです。
 * 操作を増やさず、ROUNDごとに「色」「回数」「見せ場」の狙いを変えて単調さを抑えます。
 */
export default class RoundRuleDirector {
  getRule({ roundIndex, difficultyId }) {
    const ruleIndex = roundIndex % 3;
    if (ruleIndex === 0) {
      return {
        id: 'colorFit',
        label: '色ぴったり',
        shortLabel: '色ぴったり +1',
        tip: '色ちがいなしでCLEAR',
        icon: 'target-door',
      };
    }
    if (ruleIndex === 1) {
      return {
        id: 'moveStar',
        label: '省MOVE',
        shortLabel: '省MOVE +1',
        tip: '2回以上残してCLEAR',
        icon: 'timer-bell',
      };
    }
    return {
      id: difficultyId === 'hard' ? 'splitShow' : 'cleanRoute',
      label: difficultyId === 'hard' ? '分岐ショー' : 'ノーミス',
      shortLabel: difficultyId === 'hard' ? '分岐 +1' : 'ノーミス +1',
      tip: difficultyId === 'hard' ? '分岐を使ってCLEAR' : 'ミスなしCLEAR',
      icon: difficultyId === 'hard' ? 'beam-spark' : 'perfect-star',
    };
  }

  evaluate({ rule, result, rotations, maxMoves, cleared }) {
    if (!rule) return { bonus: 0, success: false, label: '', tone: 'normal' };
    const movesLeft = Math.max(0, maxMoves - rotations);
    const noWrongColor = (result?.wrongGoals ?? 0) === 0;
    const noRouteMiss = noWrongColor && !result?.blockedByWall && !result?.looped;
    let success = false;

    if (rule.id === 'colorFit') success = cleared && noWrongColor;
    else if (rule.id === 'moveStar') success = cleared && movesLeft >= 2;
    else if (rule.id === 'splitShow') success = cleared && Boolean(result?.usedSplitter);
    else if (rule.id === 'cleanRoute') success = cleared && noRouteMiss;

    return {
      bonus: success ? 1 : 0,
      success,
      label: success ? `${rule.label} 成功` : rule.tip,
      tone: success ? 'special' : 'normal',
    };
  }

  getBadge(rule, state) {
    if (!rule) return null;
    return {
      icon: rule.icon,
      label: state?.success ? rule.shortLabel : rule.label,
      tone: state?.success ? 'special' : 'normal',
    };
  }
}
