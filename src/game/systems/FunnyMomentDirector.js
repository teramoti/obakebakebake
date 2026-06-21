/**
 * クリック後の短いリアクション文言を決めるDirectorです。
 * CLEAR、ワープ、ボーナスなどを短く表示し、盤面の出来事を観戦者にも伝えます。
 */
export default class FunnyMomentDirector {
  createReaction({ result, rotations, maxMoves, liveState, boardState }) {
    if (result?.reachedGoal) return 'ピカッとCLEAR!';
    if (liveState?.combo) return 'コンボ狙える!';
    if (boardState?.movingGoal) return 'ボーナス門!';
    if (boardState?.ghostAvoided) return 'おばけ回避!';
    if (result?.usedPortal) return 'ワープした!';
    if ((result?.crystals ?? 0) > 0) return '水晶GET!';
    if ((maxMoves - rotations) <= 2) return 'あと少し!';
    if ((result?.ghosts ?? 0) > 0 || boardState?.chaserHit) return 'おばけ近い!';
    return rotations % 2 === 0 ? 'くるっと!' : 'そこそこ!';
  }
}
