/**
 * Result画面に出す簡単な表彰項目を作るFactoryです。
 * 勝敗以外の見どころを短く出し、結果画面が点数表だけにならないようにします。
 */
import { PLAYER_NAMES } from '../data/gameConfig.js';

/**
 * ResultAwardFactory keeps result labels outside the Scene.
 * Awards are intentionally short so the result screen stays readable.
 */
export default class ResultAwardFactory {
  constructor(players) {
    this.players = players;
  }

  topBy(compareFn) {
    return [...this.players].sort(compareFn)[0];
  }

  createAwards() {
    const showStar = this.topBy((a, b) => b.liveBonus - a.liveBonus);
    const crystalKing = this.topBy((a, b) => b.crystals - a.crystals);
    const cleanest = this.topBy((a, b) => a.ghosts - b.ghosts);
    const moveSaver = this.topBy((a, b) => b.movesLeft - a.movesLeft);

    return [
      `ショー ${PLAYER_NAMES[showStar.index]}`,
      `水晶 ${PLAYER_NAMES[crystalKing.index]}`,
      `回避 ${PLAYER_NAMES[cleanest.index]}`,
      `省MOVE ${PLAYER_NAMES[moveSaver.index]}`,
    ];
  }
}
