/**
 * 盤面の状態を「今おもしろい状態か」に変換するDirectorです。
 * 正解/不正解の判定だけでなく、あと何色か、色ミス、壁停止、分岐成功などを短い言葉にします。
 */
export default class PuzzleDramaDirector {
  evaluate({ result, rotations, maxMoves, cleared }) {
    const required = Math.max(1, result?.requiredEmitters ?? 1);
    const matched = Math.max(0, result?.matchedEmitters ?? 0);
    const movesLeft = Math.max(0, maxMoves - rotations);
    const leftColors = Math.max(0, required - matched);
    const cleanRoute = (result?.ghosts ?? 0) === 0 && !result?.chaserHit;
    const colorClear = required > 1 && matched === required;
    const lowMove = cleared && rotations <= Math.max(1, Math.ceil(maxMoves * 0.45));
    const styleBonus = cleared && cleanRoute && (colorClear || result?.usedSplitter || lowMove) ? 1 : 0;

    if (cleared) {
      return {
        state: 'clear',
        label: styleBonus ? 'ナイスCLEAR +1' : 'CLEAR!',
        tone: 'clear',
        bonus: styleBonus,
        leftColors,
      };
    }
    if ((result?.wrongGoals ?? 0) > 0) {
      return { state: 'wrongColor', label: '色ちがい!', tone: 'danger', bonus: 0, leftColors };
    }
    if (result?.blockedByWall) {
      return { state: 'blocked', label: '壁でSTOP', tone: 'danger', bonus: 0, leftColors };
    }
    if (result?.looped) {
      return { state: 'loop', label: 'ぐるぐる!', tone: 'danger', bonus: 0, leftColors };
    }
    if (required > 1 && matched > 0) {
      return { state: 'near', label: `あと${leftColors}色`, tone: 'near', bonus: 0, leftColors };
    }
    if (result?.usedSplitter) {
      return { state: 'split', label: '分岐した!', tone: 'special', bonus: 0, leftColors };
    }
    if (movesLeft <= 2) {
      return { state: 'lowMove', label: '残り少ない!', tone: 'danger', bonus: 0, leftColors };
    }
    return { state: 'search', label: required > 1 ? `${required}色をつなぐ` : '光をゴールへ', tone: 'normal', bonus: 0, leftColors };
  }

  getBadges(state) {
    if (!state) return [];
    const icon = state.tone === 'danger' ? 'warning-ghost' : (state.tone === 'clear' ? 'perfect-star' : 'beam-spark');
    return [{ icon, label: state.label, tone: state.tone === 'danger' ? 'danger' : (state.tone === 'clear' || state.tone === 'special' ? 'special' : 'normal') }];
  }
}
