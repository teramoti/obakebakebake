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
    const replayLines = lines.slice(0, 24);
    const g = this.add.graphics();
    replayLines.forEach((line) => {
      const from = cellCenter(line.from);
      const to = cellCenter(line.to);
      const color = LIGHT_COLOR_HEX[line.color] ?? 0xffe66d;
      g.lineStyle(8, color, 0.0).beginPath().moveTo(from.x, from.y).lineTo(to.x, to.y).strokePath();
    });
    const pulse = this.add.graphics();
    replayLines.forEach((line) => {
      const from = cellCenter(line.from);
      const to = cellCenter(line.to);
      const color = LIGHT_COLOR_HEX[line.color] ?? 0xffe66d;
      pulse.lineStyle(6, color, 0.72).beginPath().moveTo(from.x, from.y).lineTo(to.x, to.y).strokePath();
    });
    this.tweens.add({ targets: pulse, alpha: { from: 0.15, to: 0.85 }, duration: 320, yoyo: true, repeat: 3, ease: 'Sine.easeInOut' });
  }
