/**
 * Small wrapper around Phaser Sound. It keeps volume decisions in one class and
 * lets the scene call semantic names such as playClear() instead of raw strings.
 */
export default class GameAudio {
  constructor(scene) {
    this.scene = scene;
    this.currentBgm = null;
  }

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
  playFever() { this.play('fever', 0.32); }
  playRanking() { this.play('ranking', 0.3); }

  /** Stop the previous loop and start the requested BGM loop. */
  playBgm(key, volume = 0.12) {
    if (this.currentBgm?.key === key && this.currentBgm.isPlaying) return;
    if (this.currentBgm) this.currentBgm.stop();
    this.currentBgm = this.scene.sound.add(key, { loop: true, volume });
    this.currentBgm.play();
  }

  stopBgm() {
    if (this.currentBgm) this.currentBgm.stop();
    this.currentBgm = null;
  }
}
