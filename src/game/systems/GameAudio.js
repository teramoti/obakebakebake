/**
 * BGMとSEの再生をまとめる音声管理クラスです。
 * Phaser側から名前で音を呼び、画面やイベントごとの音切り替えを集約します。
 */
export default class GameAudio {
  // Phaserのsound managerを使うためSceneを保持します。
  constructor(scene) {
    this.scene = scene;
    this.currentBgm = null;
  }

  // SE再生の共通入口です。存在しない音でもゲームが止まらないよう保護します。
  play(key, volume = 0.35) {
    if (!this.scene.sound?.get) return;
    this.scene.sound.play(key, { volume });
  }

  playStart() { this.play('start', 0.45); }
  playClick() { this.play('click', 0.35); }
  playEvent() { this.play('event', 0.28); }
  playClear() { this.play('clear', 0.45); }
  playFinish() { this.play('finish', 0.45); }
  playGhost() { this.play('ghost', 0.25); }
  playPerfect() { this.play('perfect', 0.32); }
  playAward() { this.play('award', 0.36); }
  playCountdown() { this.play('countdown', 0.3); }
  playRanking() { this.play('ranking', 0.3); }

  /** Stop the previous loop and start the requested BGM loop. */
  playBgm(key, volume = 0.12) {
    if (this.currentBgm?.key === key && this.currentBgm.isPlaying) return;
    if (this.currentBgm) this.currentBgm.stop();
    this.currentBgm = this.scene.sound.add(key, { loop: true, volume });
    this.currentBgm.play();
  }

  // 画面遷移時に前のBGMを止めます。
  stopBgm() {
    if (this.currentBgm) this.currentBgm.stop();
    this.currentBgm = null;
  }
}
