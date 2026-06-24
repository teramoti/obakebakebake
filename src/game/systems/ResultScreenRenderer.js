/**
 * Phaser側Result画面を描画するRendererです。
 * Reactへ返す前のゲーム内Result演出を、画面中央に収まる表彰画面として表示します。
 */
import Phaser from 'phaser';
import { PLAYER_COLORS, PLAYER_NAMES } from '../data/gameConfig.js';
import { GOLD, MUTED, PANEL, PINK, formatScore } from './sceneUiHelpers.js';

/**
 * 最終順位、点数、クリア数、BONUSをゲーム内で表示します。
 */
export default class ResultScreenRenderer {
  constructor(scene) {
    this.scene = scene;
  }

  showResult() { showResult.call(this.scene); }
}


function getWinReason(player){
  const totals = player.stages.reduce((acc, stage) => {
    acc.color += stage.breakdown?.color ?? 0;
    acc.rule += stage.breakdown?.rule ?? 0;
    acc.move += stage.breakdown?.move ?? 0;
    acc.live += stage.breakdown?.live ?? 0;
    acc.split += stage.breakdown?.split ?? 0;
    return acc;
  }, { color: 0, rule: 0, move: 0, live: 0, split: 0 });
  const entries = [
    ['色合わせ', totals.color],
    ['狙い達成', totals.rule],
    ['省MOVE', totals.move],
    ['小ボーナス', totals.live],
    ['分岐', totals.split],
  ].sort((a, b) => b[1] - a[1]);
  return entries[0][1] > 0 ? entries[0][0] : 'CLEAR数';
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
  g.fillStyle(0xffe66d, 0.12).fillCircle(640, 138, 170);
  g.fillStyle(0xff75d8, 0.08).fillCircle(860, 520, 210);
  g.fillStyle(PANEL, 0.96).fillRoundedRect(150, 54, 980, 606, 34);
  g.lineStyle(4, 0x6ee7ff, 0.62).strokeRoundedRect(150, 54, 980, 606, 34);

  const title = this.add.text(640, 92, 'RESULT', {
    fontFamily: 'Arial Black',
    fontSize: 56,
    color: GOLD,
    stroke: '#050718',
    strokeThickness: 10,
  }).setOrigin(0.5);
  const winner = this.add.text(640, 146, `WINNER ${PLAYER_NAMES[champion.index]}  ${formatScore(champion.totalScore)}点`, {
    fontFamily: 'Arial Black',
    fontSize: 31,
    color: PLAYER_COLORS[champion.index],
    stroke: '#050718',
    strokeThickness: 6,
  }).setOrigin(0.5);
  this.ui.pill(924, 112, `${this.roundCount} ROUND`, { bg: 0x6ee7ff, fg: '#061022', width: 126, height: 38, fontSize: 15, line: 0xffffff });
  this.ui.pill(454, 112, `勝因 ${getWinReason(champion)}`, { bg: 0xff75d8, fg: '#061022', width: 190, height: 38, fontSize: 15, line: 0xffffff });
  this.tweens.add({ targets: [title, winner], scaleX: { from: 0.94, to: 1 }, scaleY: { from: 0.94, to: 1 }, alpha: { from: 0.3, to: 1 }, duration: 360, ease: 'Back.Out' });

  ranking.forEach((player, index) => {
    const y = 190 + index * 78;
    const color = Phaser.Display.Color.HexStringToColor(PLAYER_COLORS[player.index]).color;
    const row = this.add.container(index % 2 ? -24 : 24, 0);
    const bg = this.add.graphics();
    bg.fillStyle(index === 0 ? 0x3c2e00 : 0x18204c, index === 0 ? 0.94 : 0.9).fillRoundedRect(240, y, 800, 62, 20);
    bg.lineStyle(4, index === 0 ? 0xffe66d : color, index === 0 ? 0.88 : 0.62).strokeRoundedRect(240, y, 800, 62, 20);
    const rank = this.add.text(282, y + 13, `${index + 1}`, { fontFamily: 'Arial Black', fontSize: 31, color: PLAYER_COLORS[player.index] });
    const name = this.add.text(350, y + 13, PLAYER_NAMES[player.index], { fontFamily: 'Arial Black', fontSize: 31, color: '#ffffff' });
    const score = this.add.text(620, y + 13, `${formatScore(player.totalScore)}点`, { fontFamily: 'Arial Black', fontSize: 31, color: GOLD });
    const clear = this.add.text(810, y + 19, `CLEAR ${player.clears}/${this.roundCount}`, { fontFamily: 'Arial Black', fontSize: 18, color: MUTED });
    const reason = this.add.text(950, y + 19, getWinReason(player), { fontFamily: 'Arial Black', fontSize: 16, color: MUTED });
    row.add([bg, rank, name, score, clear, reason]);
    this.tweens.add({ targets: row, x: 0, alpha: { from: 0, to: 1 }, duration: 360, delay: 90 * index, ease: 'Back.Out' });
  });

  this.add.text(640, 506, 'BONUS', { fontFamily: 'Arial Black', fontSize: 18, color: PINK }).setOrigin(0.5);

  const awards = this.awardFactory.createAwards().slice(0, 3);
  awards.forEach((award, index) => {
    const x = 382 + index * 180;
    this.ui.pill(x, 520, award, { bg: index === 0 ? 0xff75d8 : 0x26305e, fg: index === 0 ? '#061022' : '#ffffff', width: 160, height: 38, fontSize: 16, line: 0xffffff });
  });

  const button = this.add.container(0, 0);
  const buttonBg = this.add.graphics();
  buttonBg.fillStyle(0x6ee7ff, 0.95).fillRoundedRect(540, 590, 200, 52, 22);
  const buttonText = this.add.text(640, 616, 'TITLE', { fontFamily: 'Arial Black', fontSize: 22, color: '#061022' }).setOrigin(0.5);
  button.add([buttonBg, buttonText]);
  this.tweens.add({ targets: button, scaleX: 1.035, scaleY: 1.035, duration: 760, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
}
