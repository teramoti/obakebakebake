/**
 * プレイ中HUDを描画するRendererです。
 * プレイヤー、時間、得点、残り回数、小さなボーナス表示などを盤面外に整理して表示します。
 */
import Phaser from 'phaser';
import { HOW_TO_PAGES } from '../data/howToGuide.js';
import { PLAYER_COLORS, PLAYER_NAMES } from '../data/gameConfig.js';
import { CYAN, GOLD, MUTED, formatScore } from './sceneUiHelpers.js';

/**
 * HudRenderer owns live HUD, score pops and in-game help pages.
 */
export default class HudRenderer {
  // HUD描画に必要なScene状態とUI部品を保持します。
  constructor(scene) {
    this.scene = scene;
  }

  // 左上のプレイヤー・時間・点数・MOVEなど、プレイ中の主要情報を描画します。
  drawHud() { drawHud.call(this.scene); }
  // 右下に小さく出すボーナス/危険/水晶などの状況チップを描画します。
  drawGimmickBadges() { drawGimmickBadges.call(this.scene); }
  // クリック後の短いリアクション文言を一時表示します。
  drawReactionBanner() { drawReactionBanner.call(this.scene); }
  // クリック地点に出る回転・コンボ・ボーナスなどのポップ表示を描画します。
  drawScorePops() { drawScorePops.call(this.scene); }
  // Hキーで表示するゲーム内ヘルプを描画します。
  drawHelpOverlay() { drawHelpOverlay.call(this.scene); }
  // ヘルプページ番号を左右キーで切り替えます。
  changeHelpPage(delta) { changeHelpPage.call(this.scene, delta); }
}

function drawHud(){
    const currentPlayer = this.players[this.currentPlayerIndex];
    const playerName = PLAYER_NAMES[this.currentPlayerIndex];
    const playerColor = PLAYER_COLORS[this.currentPlayerIndex];
    const movesLeft = this.moveLimitManager.getMovesLeft(this.turnRotations, this.maxMoves);
    const feverWindow = Math.min(8, Math.floor(this.stageSeconds * 0.42));
    const fever = this.remaining <= feverWindow;

    // ステージ名は隠し、盤面上にHUDを重ねないため、主要情報は右側の専用パネルへ寄せます。
    // FEVERと回数が近すぎて重なったため、行を分けて安全領域内に収めます。
    const x = 842;
    const y = 30;
    const width = 380;
    const height = 176;
    this.ui.panel(x, y, width, height, {
      fill: 0x080b1e,
      alpha: 0.9,
      line: fever ? 0xffe66d : 0x6ee7ff,
      lineAlpha: 0.62,
      radius: 20,
    });

    this.add.text(x + 26, y + 24, playerName, {
      fontFamily: 'Arial Black',
      fontSize: 35,
      color: playerColor,
      stroke: '#050718',
      strokeThickness: 6,
    });
    this.add.text(x + 116, y + 31, `${formatScore(currentPlayer.totalScore)}点`, {
      fontFamily: 'Arial Black',
      fontSize: 22,
      color: '#ffffff',
    });
    this.add.text(x + 250, y + 30, `R${this.roundIndex + 1}/${this.roundCount}`, {
      fontFamily: 'Arial Black',
      fontSize: 25,
      color: GOLD,
    });

    this.add.text(x + 34, y + 86, `${Math.ceil(this.remaining)}秒`, {
      fontFamily: 'Arial Black',
      fontSize: 42,
      color: fever ? GOLD : '#ffffff',
      stroke: '#050718',
      strokeThickness: 7,
    });
    this.add.text(x + 206, y + 91, `回数 ${movesLeft}/${this.maxMoves}`, {
      fontFamily: 'Arial Black',
      fontSize: 23,
      color: movesLeft <= 2 ? GOLD : MUTED,
    });

    if ((this.currentResult?.requiredEmitters ?? 1) > 1) {
      this.add.text(x + 208, y + 122, `色 ${this.currentResult.matchedEmitters}/${this.currentResult.requiredEmitters}`, {
        fontFamily: 'Arial Black',
        fontSize: 18,
        color: CYAN,
      });
    }

    const progressG = this.add.graphics();
    progressG.fillStyle(0x182147, 0.92).fillRoundedRect(x + 30, y + 148, width - 60, 10, 5);
    progressG.fillStyle(fever ? 0xffe66d : 0x6ee7ff, 0.96).fillRoundedRect(x + 30, y + 148, (width - 60) * Math.max(0, this.remaining / this.stageSeconds), 10, 5);

    if (fever) {
      this.ui.pill(x + 282, y + 70, 'FEVER', {
        bg: 0xffe66d,
        fg: '#061022',
        width: 92,
        height: 30,
        fontSize: 15,
        line: 0xffffff,
      });
    }
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
    if ((this.currentResult?.requiredEmitters ?? 1) > 1) {
      badges.unshift({ icon: 'flashlight', label: `色 ${this.currentResult.matchedEmitters}/${this.currentResult.requiredEmitters}`, tone: this.currentResult.reachedGoal ? 'special' : 'normal' });
    }
    if (this.currentStage?.splitters?.length) {
      badges.unshift({ icon: 'beam-spark', label: this.currentResult?.usedSplitter ? '分岐 +1' : '分岐', tone: this.currentResult?.usedSplitter ? 'special' : 'normal' });
    }
    badges = [...boardBadges, ...twistBadges, ...badges].slice(0, 4);

    // 右下の小チップは補足情報です。盤面より目立たないサイズに抑えます。
    badges.forEach((badge, index) => {
      const x = 760 + (index % 2) * 210;
      const y = 548 + Math.floor(index / 2) * 54;
      const lineColor = badge.tone === 'danger' ? 0xff75d8 : (badge.tone === 'special' ? 0xffe66d : 0x6ee7ff);
      this.ui.panel(x, y, 188, 42, { fill: 0x0b1230, alpha: 0.86, line: lineColor, lineAlpha: 0.56, radius: 14 });
      this.add.image(x + 25, y + 21, `icon-${badge.icon}`).setDisplaySize(22, 22);
      this.add.text(x + 104, y + 21, badge.label, {
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
    g.fillStyle(0x0b1230, 0.82 * alpha).fillRoundedRect(728, 458, 420, 46, 18);
    g.lineStyle(3, 0xffe66d, 0.72 * alpha).strokeRoundedRect(728, 458, 420, 46, 18);
    this.add.text(938, 481, this.reactionText, {
      fontFamily: 'Arial Black',
      fontSize: 21,
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
    g.fillStyle(0x030611, 0.86).fillRoundedRect(170, 80, 940, 560, 34);
    g.lineStyle(5, 0xffe66d, 0.9).strokeRoundedRect(170, 80, 940, 560, 34);

    this.ui.pill(220, 112, `PAGE ${page.number}/3`, { bg: 0xffe66d, fg: '#061022', width: 128, height: 38, fontSize: 18 });
    this.add.text(640, 125, page.title, { fontFamily: 'Arial Black', fontSize: 44, color: '#ffffff', stroke: '#050718', strokeThickness: 8 }).setOrigin(0.5);
    this.add.text(640, 178, page.lead, { fontFamily: 'Arial Black', fontSize: 20, color: MUTED, align: 'center', wordWrap: { width: 760 } }).setOrigin(0.5);

    page.cards.forEach(([icon, title, text], index) => {
      const x = 230 + index * 278;
      this.ui.panel(x, 238, 232, 140, { fill: index === this.helpPageIndex ? 0x182455 : 0x111936, line: index === 1 ? 0xff75d8 : 0x6ee7ff, lineAlpha: 0.58, radius: 22 });
      this.add.image(x + 116, 268, `icon-${icon}`).setDisplaySize(42, 42);
      this.add.text(x + 116, 317, title, { fontFamily: 'Arial Black', fontSize: 20, color: GOLD }).setOrigin(0.5);
      this.add.text(x + 116, 350, text, { fontFamily: 'Arial Black', fontSize: 15, color: '#ffffff', align: 'center', wordWrap: { width: 190 } }).setOrigin(0.5);
    });

    this.ui.panel(230, 408, 820, 104, { fill: 0x0d1433, line: 0x7dff96, lineAlpha: 0.42, radius: 22 });
    this.add.text(640, 438, page.callout, { fontFamily: 'Arial Black', fontSize: 21, color: GOLD, align: 'center', wordWrap: { width: 760 } }).setOrigin(0.5);
    drawHelpMotionDemo.call(this, page.number);

    ['1', '2', '3'].forEach((num, index) => {
      this.ui.pill(516 + index * 76, 548, num, { bg: index === this.helpPageIndex ? 0xff75d8 : 0x26305e, fg: index === this.helpPageIndex ? '#061022' : '#ffffff', width: 54, height: 42, fontSize: 22, line: 0xffffff });
    });
    this.add.text(640, 608, '← → PAGE   H', { fontFamily: 'Arial Black', fontSize: 19, color: '#ffffff' }).setOrigin(0.5);
  }
