/**
 * プレイ中HUDを描画するRendererです。
 * 盤面に重ならない右側情報パネルへ、時間・回数・色達成・小ボーナスを整理して表示します。
 * ステージ名は隠し、プレイヤーが盤面と残り条件だけを見られるようにします。
 */
import Phaser from 'phaser';
import { HOW_TO_PAGES } from '../data/howToGuide.js';
import { PLAYER_COLORS, PLAYER_NAMES } from '../data/gameConfig.js';
import { CYAN, GOLD, MUTED, PANEL, formatScore } from './sceneUiHelpers.js';

const HUD_X = 760;
const HUD_Y = 42;
const HUD_W = 470;
const HUD_H = 310;
const CHIP_X = 770;
const CHIP_Y = 360;
const ACTION_Y = 590;
const TITLE_X = 1016;

/**
 * プレイ中の情報表示、スコアポップ、ゲーム内ヘルプを担当します。
 */
export default class HudRenderer {
  constructor(scene) {
    this.scene = scene;
  }

  drawHud() { drawHud.call(this.scene); }
  drawGimmickBadges() { drawGimmickBadges.call(this.scene); }
  drawReactionBanner() { drawReactionBanner.call(this.scene); }
  drawScorePops() { drawScorePops.call(this.scene); }
  drawHelpOverlay() { drawHelpOverlay.call(this.scene); }
  changeHelpPage(delta) { changeHelpPage.call(this.scene, delta); }
}

function drawHud(){
  const currentPlayer = this.players[this.currentPlayerIndex];
  const playerName = PLAYER_NAMES[this.currentPlayerIndex];
  const playerColor = PLAYER_COLORS[this.currentPlayerIndex];
  const movesLeft = this.moveLimitManager.getMovesLeft(this.turnRotations, this.maxMoves);
  const secondsLeft = Math.ceil(this.remaining);
  const progress = Math.max(0, Math.min(1, this.remaining / this.stageSeconds));
  const colorNeeded = this.currentResult?.requiredEmitters ?? 1;
  const colorDone = this.currentResult?.matchedEmitters ?? (this.currentResult?.reachedGoal ? 1 : 0);
  const scorePreview = this.getCurrentScorePreview?.() ?? { score: 0 };
  const maxScore = this.getMaxTurnScore?.() ?? 0;
  const isReadyToFinish = Boolean(this.currentResult?.reachedGoal);

  // 右側HUDは「状態」「狙い」「操作ボタン」の3ブロックへ分けます。
  // 以前はスコア行と狙いチップが同じ高さに重なり、画面が読みにくくなっていました。
  this.ui.panel(HUD_X, HUD_Y, HUD_W, HUD_H, {
    fill: 0x080b1e,
    alpha: 0.94,
    line: isReadyToFinish ? 0x7dff96 : 0x6ee7ff,
    lineAlpha: 0.68,
    lineWidth: 4,
    radius: 26,
  });

  this.add.text(HUD_X + 26, HUD_Y + 22, playerName, {
    fontFamily: 'Arial Black',
    fontSize: 40,
    color: playerColor,
    stroke: '#050718',
    strokeThickness: 7,
  });
  this.add.text(HUD_X + 110, HUD_Y + 32, `${formatScore(currentPlayer.totalScore)}点`, {
    fontFamily: 'Arial Black',
    fontSize: 21,
    color: '#ffffff',
  });
  this.ui.pill(HUD_X + HUD_W - 116, HUD_Y + 24, `R${this.roundIndex + 1}/3`, {
    bg: 0xffe66d,
    fg: '#061022',
    width: 92,
    height: 32,
    fontSize: 16,
    line: 0xffffff,
  });

  this.add.text(HUD_X + 34, HUD_Y + 82, `${secondsLeft}`, {
    fontFamily: 'Arial Black',
    fontSize: 66,
    color: secondsLeft <= 3 ? GOLD : '#ffffff',
    stroke: '#050718',
    strokeThickness: 9,
  });
  this.add.text(HUD_X + 128, HUD_Y + 116, '秒', {
    fontFamily: 'Arial Black',
    fontSize: 20,
    color: MUTED,
  });

  this.ui.panel(HUD_X + 230, HUD_Y + 84, 190, 72, {
    fill: 0x101a3e,
    alpha: 0.96,
    line: movesLeft <= 2 ? 0xffe66d : 0x6ee7ff,
    lineAlpha: 0.52,
    radius: 18,
  });
  this.add.text(HUD_X + 325, HUD_Y + 101, '回数', {
    fontFamily: 'Arial Black',
    fontSize: 14,
    color: MUTED,
  }).setOrigin(0.5);
  this.add.text(HUD_X + 325, HUD_Y + 129, `${movesLeft}/${this.maxMoves}`, {
    fontFamily: 'Arial Black',
    fontSize: 28,
    color: movesLeft <= 2 ? GOLD : '#ffffff',
  }).setOrigin(0.5);

  this.ui.panel(HUD_X + 28, HUD_Y + 170, 392, 44, {
    fill: 0x101a3e,
    alpha: 0.96,
    line: colorDone >= colorNeeded ? 0x7dff96 : 0x6ee7ff,
    lineAlpha: 0.44,
    radius: 15,
  });
  this.add.image(HUD_X + 54, HUD_Y + 192, 'icon-flashlight').setDisplaySize(22, 22);
  this.add.text(HUD_X + 82, HUD_Y + 183, colorNeeded > 1 ? `色 ${colorDone}/${colorNeeded}` : 'ゴールへ', {
    fontFamily: 'Arial Black',
    fontSize: 16,
    color: colorDone >= colorNeeded ? '#7dff96' : '#ffffff',
  });
  const dramaLabel = this.currentDramaState?.label ?? '鏡を回す';
  const dramaColor = this.currentDramaState?.tone === 'danger' ? '#ffb4ea' : (this.currentDramaState?.tone === 'clear' ? '#7dff96' : CYAN);
  this.add.text(HUD_X + 250, HUD_Y + 183, dramaLabel, {
    fontFamily: 'Arial Black',
    fontSize: dramaLabel.length >= 8 ? 13 : 15,
    color: dramaColor,
  });

  this.ui.panel(HUD_X + 28, HUD_Y + 228, 392, 52, {
    fill: 0x101a3e,
    alpha: 0.96,
    line: 0xffe66d,
    lineAlpha: 0.42,
    radius: 15,
  });
  this.add.text(HUD_X + 52, HUD_Y + 241, '現在', { fontFamily: 'Arial Black', fontSize: 13, color: MUTED });
  this.add.text(HUD_X + 52, HUD_Y + 260, `${scorePreview.score}点`, { fontFamily: 'Arial Black', fontSize: 20, color: GOLD });
  this.add.text(HUD_X + 162, HUD_Y + 241, '最大', { fontFamily: 'Arial Black', fontSize: 13, color: MUTED });
  this.add.text(HUD_X + 162, HUD_Y + 260, `${maxScore}点`, { fontFamily: 'Arial Black', fontSize: 20, color: '#ffffff' });
  this.add.text(HUD_X + 270, HUD_Y + 241, '狙い', { fontFamily: 'Arial Black', fontSize: 13, color: MUTED });
  this.add.text(HUD_X + 270, HUD_Y + 260, this.currentRoundRule?.label ?? 'CLEAR', {
    fontFamily: 'Arial Black',
    fontSize: String(this.currentRoundRule?.label ?? 'CLEAR').length >= 7 ? 13 : 16,
    color: CYAN,
  });

  const bar = this.add.graphics();
  bar.fillStyle(0x182147, 0.95).fillRoundedRect(HUD_X + 28, HUD_Y + 294, 392, 9, 5);
  bar.fillStyle(secondsLeft <= 3 ? 0xffe66d : 0x6ee7ff, 0.96).fillRoundedRect(HUD_X + 28, HUD_Y + 294, 392 * progress, 9, 5);

  const finishBg = isReadyToFinish ? 0x7dff96 : 0x26305e;
  const finishFg = isReadyToFinish ? '#061022' : '#ffffff';
  this.ui.pill(784, ACTION_Y, isReadyToFinish ? 'FINISH' : '未達成', {
    bg: finishBg,
    fg: finishFg,
    width: 214,
    height: 58,
    fontSize: 22,
    line: isReadyToFinish ? 0xffffff : 0x6ee7ff,
  });
  this.ui.pill(TITLE_X, ACTION_Y, 'TITLE', {
    bg: 0x26305e,
    fg: '#ffffff',
    width: 188,
    height: 58,
    fontSize: 21,
    line: 0xffffff,
  });
}

function drawGimmickBadges(){
  const movesLeft = this.moveLimitManager.getMovesLeft(this.turnRotations, this.maxMoves);
  let badges = this.gimmickDirector?.getLiveBadges({
    result: this.currentResult,
    movesLeft,
    maxMoves: this.maxMoves,
  }) ?? [];
  const twistBadges = this.liveTwistManager?.getLiveBadges(this.currentResult, this.time.now) ?? [];
  const boardBadges = this.movingBoardDirector?.getLiveBadges(this.currentResult, this.time.now) ?? [];
  const dramaBadges = this.puzzleDramaDirector?.getBadges(this.currentDramaState) ?? [];
  const ruleBadge = this.roundRuleDirector?.getBadge(this.currentRoundRule, this.currentRoundRuleState);

  if ((this.currentResult?.requiredEmitters ?? 1) > 1) {
    badges.unshift({ icon: 'flashlight', label: `色 ${this.currentResult.matchedEmitters}/${this.currentResult.requiredEmitters}`, tone: this.currentResult.reachedGoal ? 'special' : 'normal' });
  }
  if (this.currentStage?.splitters?.length) {
    badges.unshift({ icon: 'beam-spark', label: this.currentResult?.usedSplitter ? '分岐 +1' : '分岐', tone: this.currentResult?.usedSplitter ? 'special' : 'normal' });
  }

  badges = [ruleBadge, ...dramaBadges, ...boardBadges, ...twistBadges, ...badges].filter(Boolean).slice(0, 6);

  this.ui.panel(CHIP_X - 10, CHIP_Y - 12, 450, 190, {
    fill: PANEL,
    alpha: 0.86,
    line: 0x6ee7ff,
    lineAlpha: 0.36,
    radius: 22,
  });
  this.add.text(CHIP_X + 12, CHIP_Y + 6, '狙い・ギミック', {
    fontFamily: 'Arial Black',
    fontSize: 16,
    color: GOLD,
  });

  badges.forEach((badge, index) => {
    const x = CHIP_X + (index % 2) * 216;
    const y = CHIP_Y + 38 + Math.floor(index / 2) * 44;
    const lineColor = badge.tone === 'danger' ? 0xff75d8 : (badge.tone === 'special' ? 0xffe66d : 0x6ee7ff);
    this.ui.panel(x, y, 198, 34, { fill: 0x0b1230, alpha: 0.9, line: lineColor, lineAlpha: 0.58, radius: 13 });
    this.add.image(x + 23, y + 17, `icon-${badge.icon}`).setDisplaySize(19, 19);
    this.add.text(x + 108, y + 17, badge.label, {
      fontFamily: 'Arial Black',
      fontSize: badge.label.length >= 7 ? 12 : 14,
      color: badge.tone === 'danger' ? '#ffb4ea' : '#ffffff',
    }).setOrigin(0.5);
  });
}

function drawReactionBanner(){
  if (!this.reactionText) return;
  const age = this.time.now - (this.reactionBorn ?? 0);
  if (age > 1100) return;
  const alpha = Phaser.Math.Clamp(1 - age / 1100, 0, 1);
  const g = this.add.graphics();
  g.fillStyle(0x0b1230, 0.84 * alpha).fillRoundedRect(780, 536, 440, 42, 16);
  g.lineStyle(3, 0xffe66d, 0.72 * alpha).strokeRoundedRect(780, 536, 440, 42, 16);
  this.add.text(1000, 557, this.reactionText, {
    fontFamily: 'Arial Black',
    fontSize: 18,
    color: '#ffe66d',
    stroke: '#050718',
    strokeThickness: 5,
  }).setOrigin(0.5).setAlpha(alpha);
}

function drawScorePops(){
  const now = this.time.now;
  this.scorePops = this.scorePops.filter((pop) => now - pop.born < 650);

  this.scorePops.forEach((pop) => {
    const age = now - pop.born;
    const lift = age / 10;
    const alpha = Phaser.Math.Clamp(1 - age / 650, 0, 1);
    this.add.text(pop.x, pop.y - lift, pop.text, {
      fontFamily: 'Arial Black',
      fontSize: 22,
      color: GOLD,
      stroke: '#050718',
      strokeThickness: 5,
    }).setOrigin(0.5).setAlpha(alpha);
  });
}

function changeHelpPage(delta){
  if (!this.showHelpOverlay || this.mode !== 'playing') return;
  this.helpPageIndex = Phaser.Math.Clamp(this.helpPageIndex + delta, 0, HOW_TO_PAGES.length - 1);
  this.drawPlaying();
}

function drawHelpMotionDemo(pageNumber){
  const baseX = 416;
  const y = 478;
  const icons = pageNumber === 3
    ? [['target-door', '+2'], ['crystal', '+1'], ['ghost', '-1']]
    : [['flashlight', ''], ['mirror-slash', '↻'], ['target-door', '']];

  icons.forEach(([icon, label], index) => {
    const x = baseX + index * 112;
    this.add.image(x, y, `icon-${icon}`).setDisplaySize(30, 30);
    if (label) {
      this.add.text(x, y + 32, label, {
        fontFamily: 'Arial Black',
        fontSize: 16,
        color: pageNumber === 3 && label === '-1' ? '#ff75d8' : GOLD,
        stroke: '#050718',
        strokeThickness: 4,
      }).setOrigin(0.5);
    }
  });

  if (pageNumber !== 3) {
    const g = this.add.graphics();
    g.lineStyle(5, 0x6ee7ff, 0.62).beginPath().moveTo(baseX + 30, y).lineTo(baseX + 194, y).strokePath();
    const phase = (this.time.now % 1100) / 1100;
    const dotX = baseX + 28 + 178 * phase;
    this.add.circle(dotX, y, 8, 0xffe66d, 0.95).setStrokeStyle(3, 0xffffff, 0.8);
    if (pageNumber === 2) {
      const ringSize = 24 + Math.sin(this.time.now / 120) * 6;
      const ring = this.add.graphics();
      ring.lineStyle(4, 0xffe66d, 0.72).strokeCircle(baseX + 112, y, ringSize);
    }
  }
}

function drawHelpOverlay(){
  const page = HOW_TO_PAGES[this.helpPageIndex] ?? HOW_TO_PAGES[0];
  const g = this.add.graphics();
  g.fillStyle(0x030611, 0.88).fillRoundedRect(170, 80, 940, 560, 34);
  g.lineStyle(5, 0xffe66d, 0.9).strokeRoundedRect(170, 80, 940, 560, 34);

  this.ui.pill(220, 112, `PAGE ${page.number}/3`, { bg: 0xffe66d, fg: '#061022', width: 128, height: 38, fontSize: 18 });
  this.add.text(640, 125, page.title, { fontFamily: 'Arial Black', fontSize: 42, color: '#ffffff', stroke: '#050718', strokeThickness: 8 }).setOrigin(0.5);
  this.add.text(640, 176, page.lead, { fontFamily: 'Arial Black', fontSize: 19, color: MUTED, align: 'center', wordWrap: { width: 760 } }).setOrigin(0.5);

  page.cards.forEach(([icon, title, text], index) => {
    const x = 230 + index * 278;
    this.ui.panel(x, 232, 232, 134, { fill: index === this.helpPageIndex ? 0x182455 : 0x111936, line: index === 1 ? 0xff75d8 : 0x6ee7ff, lineAlpha: 0.58, radius: 22 });
    this.add.image(x + 116, 260, `icon-${icon}`).setDisplaySize(40, 40);
    this.add.text(x + 116, 307, title, { fontFamily: 'Arial Black', fontSize: 19, color: GOLD }).setOrigin(0.5);
    this.add.text(x + 116, 340, text, { fontFamily: 'Arial Black', fontSize: 14, color: '#ffffff', align: 'center', wordWrap: { width: 190 } }).setOrigin(0.5);
  });

  this.ui.panel(230, 394, 820, 110, { fill: 0x0d1433, line: 0x7dff96, lineAlpha: 0.42, radius: 22 });
  this.add.text(640, 420, page.callout, { fontFamily: 'Arial Black', fontSize: 19, color: GOLD, align: 'center', wordWrap: { width: 760 } }).setOrigin(0.5);
  drawHelpMotionDemo.call(this, page.number);

  ['1', '2', '3'].forEach((num, index) => {
    this.ui.pill(516 + index * 76, 548, num, { bg: index === this.helpPageIndex ? 0xff75d8 : 0x26305e, fg: index === this.helpPageIndex ? '#061022' : '#ffffff', width: 54, height: 42, fontSize: 22, line: 0xffffff });
  });
  this.add.text(640, 608, '← → PAGE   H', { fontFamily: 'Arial Black', fontSize: 19, color: '#ffffff' }).setOrigin(0.5);
}
