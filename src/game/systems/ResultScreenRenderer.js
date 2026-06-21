/**
 * Phaser側Result画面を描画するRendererです。
 * React Result連携前のゲーム内Result表示や、タイトルへ戻る操作を担当します。
 */
import Phaser from 'phaser';
import { PLAYER_COLORS, PLAYER_NAMES } from '../data/gameConfig.js';
import { GOLD, MUTED, PANEL, PINK, formatScore } from './sceneUiHelpers.js';

/**
 * ResultScreenRenderer owns final ranking and bonus presentation.
 */
export default class ResultScreenRenderer {
  // Result描画に必要なScene状態を保持します。
  constructor(scene) {
    this.scene = scene;
  }

  // 順位、点数、クリア数、BONUSをゲーム内Resultとして表示します。
  showResult() { showResult.call(this.scene); }
}

function showResult(){
    this.mode = 'result';
    this.audio.playBgm('bgm-result', 0.12);
    this.audio.playAward();
    this.audio.playRanking();
    this.clearScreen();
    this.drawBackground();
    const ranking = this.scoreLedger.getRanking();
    const champion = ranking[0];

    this.addConfettiRain();
    const g = this.add.graphics();
    g.fillStyle(0xffe66d, 0.13).fillCircle(640, 158, 170);
    g.fillStyle(0xffe66d, 0.08).fillCircle(640, 158, 240);

    const title = this.add.text(640, 58, 'RESULT', { fontFamily: 'Arial Black', fontSize: 58, color: GOLD, stroke: '#050718', strokeThickness: 10 }).setOrigin(0.5);
    const winner = this.add.text(640, 122, `WINNER ${PLAYER_NAMES[champion.index]}  ${formatScore(champion.totalScore)}点`, { fontFamily: 'Arial Black', fontSize: 34, color: PLAYER_COLORS[champion.index], stroke: '#050718', strokeThickness: 6 }).setOrigin(0.5);
    this.tweens.add({ targets: [title, winner], scaleX: { from: 0.94, to: 1 }, scaleY: { from: 0.94, to: 1 }, alpha: { from: 0.3, to: 1 }, duration: 360, ease: 'Back.Out' });

    ranking.forEach((player, index) => {
      const y = 176 + index * 92;
      const color = Phaser.Display.Color.HexStringToColor(PLAYER_COLORS[player.index]).color;
      const width = index === 0 ? 810 : 760;
      const x = index === 0 ? 92 : 116;
      const row = this.add.container(index % 2 ? -24 : 24, 0);
      const bg = this.add.graphics();
      bg.fillStyle(index === 0 ? 0x3c2e00 : PANEL, 0.95).fillRoundedRect(x, y, width, 72, 24);
      bg.lineStyle(4, color, 0.82).strokeRoundedRect(x, y, width, 72, 24);
      const rank = this.add.text(x + 40, y + 18, `${index + 1}`, { fontFamily: 'Arial Black', fontSize: 34, color: PLAYER_COLORS[player.index] });
      const name = this.add.text(x + 108, y + 18, PLAYER_NAMES[player.index], { fontFamily: 'Arial Black', fontSize: 34, color: '#ffffff' });
      const score = this.add.text(x + 302, y + 18, `${formatScore(player.totalScore)}点`, { fontFamily: 'Arial Black', fontSize: 34, color: GOLD });
      const clear = this.add.text(x + 520, y + 24, `クリア ${player.clears}/${this.roundCount}`, { fontFamily: 'Arial Black', fontSize: 20, color: MUTED });
      row.add([bg, rank, name, score, clear]);
      this.tweens.add({ targets: row, x: 0, alpha: { from: 0, to: 1 }, duration: 360, delay: 90 * index, ease: 'Back.Out' });
    });

    g.fillStyle(PANEL, 0.92).fillRoundedRect(914, 184, 260, 230, 26);
    this.add.text(1044, 222, 'BONUS', { fontFamily: 'Arial Black', fontSize: 30, color: PINK }).setOrigin(0.5);
    const awards = this.awardFactory.createAwards().slice(0, 3);
    awards.forEach((award, index) => {
      const y = 278 + index * 56;
      const badge = this.add.container(0, 0);
      const bg = this.add.graphics();
      bg.fillStyle(0x141c42, 0.96).fillRoundedRect(948, y - 24, 192, 40, 16);
      const label = this.add.text(1044, y - 3, award, { fontFamily: 'Arial Black', fontSize: 21, color: '#ffffff' }).setOrigin(0.5);
      badge.add([bg, label]);
      this.tweens.add({ targets: badge, y: { from: 16, to: 0 }, alpha: { from: 0, to: 1 }, duration: 260, delay: 420 + index * 90, ease: 'Sine.easeOut' });
    });

    const button = this.add.container(0, 0);
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x6ee7ff, 0.95).fillRoundedRect(540, 640, 200, 50, 20);
    const buttonText = this.add.text(640, 665, 'TITLE', { fontFamily: 'Arial Black', fontSize: 20, color: '#061022' }).setOrigin(0.5);
    button.add([buttonBg, buttonText]);
    this.tweens.add({ targets: button, scaleX: 1.035, scaleY: 1.035, duration: 760, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
