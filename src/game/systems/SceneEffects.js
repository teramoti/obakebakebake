/**
 * 紙吹雪、CLEARバースト、光ルートリプレイなどの演出を担当します。
 * ゲームの判定処理とは分け、見た目の動きだけをここに集約します。
 */
import { cellCenter } from './sceneUiHelpers.js';
import { LIGHT_COLOR_HEX } from './ColorPuzzleDirector.js';

/**
 * SceneEffects owns reusable motion effects used by clear and result screens.
 */
export default class SceneEffects {
  // 紙吹雪や光ルート再生を描くため、Sceneを保持します。
  constructor(scene) {
    this.scene = scene;
  }

  // ResultやCLEAR時の盛り上げ用紙吹雪を追加します。
  addConfettiRain() { addConfettiRain.call(this.scene); }
  // CLEARした瞬間に盤面上へ短い光の爆発を出します。
  addClearBurst() { addClearBurst.call(this.scene); }
  // クリア後、光が通った道をなぞって観戦者にも解法を見せます。
  addRouteReplay(lines) { addRouteReplay.call(this.scene, lines); }
}

function addConfettiRain(){
    const colors = [0x6ee7ff, 0xff75d8, 0xffe66d, 0x7dff96];
    for (let i = 0; i < 42; i += 1) {
      const x = 60 + ((i * 113) % 1160);
      const y = -40 - ((i * 37) % 220);
      const piece = this.add.rectangle(x, y, 10 + (i % 3) * 5, 16, colors[i % colors.length], 0.9);
      piece.setAngle((i * 31) % 180);
      this.tweens.add({
        targets: piece,
        y: 760,
        x: x + ((i % 2 ? 1 : -1) * (30 + (i % 5) * 8)),
        angle: piece.angle + 360,
        alpha: { from: 0.95, to: 0.18 },
        duration: 2400 + (i % 8) * 160,
        delay: (i % 10) * 70,
        repeat: -1,
      });
    }
  }

function addClearBurst(){
    const colors = [0x6ee7ff, 0xff75d8, 0xffe66d, 0x7dff96];
    for (let i = 0; i < 18; i += 1) {
      const angle = (Math.PI * 2 * i) / 18;
      const dot = this.add.circle(640, 176, 6, colors[i % colors.length], 0.95);
      this.tweens.add({
        targets: dot,
        x: 640 + Math.cos(angle) * 210,
        y: 176 + Math.sin(angle) * 120,
        alpha: 0,
        scale: 0.2,
        duration: 620,
        ease: 'Cubic.easeOut',
      });
    }
  }


function addRouteReplay(lines = []){
    if (!lines.length) return;
    const replayLines = lines.slice(0, 28);
    const pulse = this.add.graphics();
    replayLines.forEach((line) => {
      const from = cellCenter(line.from);
      const to = cellCenter(line.to);
      const color = LIGHT_COLOR_HEX[line.color] ?? 0xffe66d;
      pulse.lineStyle(8, color, 0.52).beginPath().moveTo(from.x, from.y).lineTo(to.x, to.y).strokePath();
    });
    this.tweens.add({ targets: pulse, alpha: { from: 0.12, to: 0.9 }, duration: 260, yoyo: true, repeat: 4, ease: 'Sine.easeInOut' });

    replayLines.forEach((line, index) => {
      const from = cellCenter(line.from);
      const to = cellCenter(line.to);
      const color = LIGHT_COLOR_HEX[line.color] ?? 0xffe66d;
      this.time.delayedCall(index * 36, () => {
        const spark = this.add.circle(from.x, from.y, 8, color, 0.98).setStrokeStyle(3, 0xffffff, 0.82);
        this.tweens.add({
          targets: spark,
          x: to.x,
          y: to.y,
          scale: { from: 1.3, to: 0.45 },
          alpha: { from: 1, to: 0.05 },
          duration: 220,
          ease: 'Cubic.easeOut',
          onComplete: () => spark.destroy(),
        });
      });
    });

    const label = this.add.text(640, 156, 'ROUTE REPLAY', {
      fontFamily: 'Arial Black',
      fontSize: 28,
      color: '#ffe66d',
      stroke: '#050718',
      strokeThickness: 7,
    }).setOrigin(0.5);
    this.tweens.add({ targets: label, y: 126, alpha: 0, duration: 900, delay: 280, ease: 'Cubic.easeOut' });
  }
