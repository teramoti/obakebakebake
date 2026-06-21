/**
 * ターン開始、交代、ラウンド案内など、プレイ前後の流れを描画するRendererです。
 * 待ち時間を短くしつつ、次に何をするかを画面内ポップアップで伝えます。
 */
import Phaser from 'phaser';
import { PLAYER_COLORS, PLAYER_NAMES } from '../data/gameConfig.js';
import GimmickDirector from './GimmickDirector.js';
import { CYAN, GOLD, MUTED, PANEL, compactDifficultyLabel, compactMission, formatScore } from './sceneUiHelpers.js';

/**
 * FlowScreenRenderer owns READY, turn intro, and handoff screens.
 */
export default class FlowScreenRenderer {
  // READY、INTRO、HANDOFF画面でScene状態を参照するため保持します。
  constructor(scene) {
    this.scene = scene;
  }

  // ゲーム開始前のREADY画面を描画します。
  showReadyScreen() { showReadyScreen.call(this.scene); }
  // ラウンド、MOVE、イベント、STARTを短く見せるターン前画面です。
  showTurnIntro() { showTurnIntro.call(this.scene); }
  // 次プレイヤーへ渡す短い交代ポップアップを描画します。
  showHandoff() { showHandoff.call(this.scene); }
  // 次に遊ぶプレイヤー名を表示用に返します。
  getNextLabel() { return getNextLabel.call(this.scene); }
}

function showReadyScreen(){
    this.mode = 'ready';
    this.audio.playBgm('bgm-title', 0.1);
    this.clearScreen();
    this.drawBackground();

    const panel = this.ui.panel(165, 86, 950, 520, { fill: 0x080b1e, alpha: 0.92, line: 0xffe66d, lineAlpha: 0.72, lineWidth: 5, radius: 34 });
    const title = this.ui.headline(640, 160, 'おばけミラー', 62, '#ffffff');
    const lead = this.add.text(640, 220, '鏡を回して、光をゴールへ', {
      fontFamily: 'Arial Black',
      fontSize: 27,
      color: CYAN,
      stroke: '#050718',
      strokeThickness: 5,
    }).setOrigin(0.5);

    const cards = [
      ['mirror-slash', '回す'],
      ['beam-spark', 'つなぐ'],
      ['target-door', 'ゴール'],
    ];
    cards.forEach(([icon, text], index) => {
      const x = 300 + index * 240;
      const card = this.ui.panel(x, 292, 200, 128, { fill: index === 1 ? 0x182455 : 0x111936, line: index === 1 ? 0xff75d8 : 0x6ee7ff, lineAlpha: 0.78, radius: 24 });
      const image = this.add.image(x + 100, 325, `icon-${icon}`).setDisplaySize(42, 42);
      const label = this.add.text(x + 100, 382, text, { fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff' }).setOrigin(0.5);
      this.tweens.add({ targets: [card, image, label], y: '-=8', duration: 680, yoyo: true, repeat: -1, delay: index * 120, ease: 'Sine.easeInOut' });
    });

    this.add.text(640, 472, `${this.playerCount}P / ${compactDifficultyLabel(this.difficulty)} / ${this.roundCount}ラウンド`, {
      fontFamily: 'Arial Black',
      fontSize: 22,
      color: GOLD,
    }).setOrigin(0.5);
    const start = this.ui.pill(445, 532, 'CLICK START', { bg: 0x6ee7ff, fg: '#061022', width: 390, height: 54, fontSize: 24, line: 0xffffff });
    this.tweens.add({ targets: [panel, title, lead, start], scaleX: { from: 0.98, to: 1 }, scaleY: { from: 0.98, to: 1 }, alpha: { from: 0.65, to: 1 }, duration: 360, ease: 'Back.Out' });
  }

function showTurnIntro(){
    this.mode = 'intro';
    this.audio.playEvent();
    const turn = this.turnManager.getCurrentTurn();
    this.currentEvent = turn.event;
    this.currentPlayerIndex = turn.playerIndex;
    this.currentStage = this.prepareStage ? this.prepareStage(turn.stage) : turn.stage;
    this.gimmickDirector = new GimmickDirector(this.currentEvent);
    const previewMaxMoves = this.moveLimitManager.getMaxMoves(this.currentStage, this.gimmickDirector.getMoveBonus());
    this.clearScreen();
    this.drawBackground();

    const playerColor = PLAYER_COLORS[this.currentPlayerIndex];
    const eventColor = this.currentEvent?.color ?? CYAN;
    const panel = this.ui.panel(150, 88, 980, 540, { fill: 0x080b1e, alpha: 0.93, line: Phaser.Display.Color.HexStringToColor(playerColor).color, lineAlpha: 0.86, lineWidth: 5, radius: 34 });
    const playerText = this.add.text(640, 142, PLAYER_NAMES[this.currentPlayerIndex], { fontFamily: 'Arial Black', fontSize: 70, color: playerColor, stroke: '#050718', strokeThickness: 10 }).setOrigin(0.5);
    this.add.text(640, 205, `ROUND ${this.roundIndex + 1}/${this.roundCount}`, { fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff' }).setOrigin(0.5);

    const cards = [
      ['mirror-slash', '操作', 'クリック回転', CYAN],
      ['timer-bell', '回数', `${previewMaxMoves}回まで`, GOLD],
      ['round-ticket', 'イベント', this.gimmickDirector.getEventTip(), eventColor],
    ];
    cards.forEach(([icon, label, value, color], index) => {
      const x = 230 + index * 275;
      const card = this.ui.panel(x, 270, 225, 124, { fill: 0x111936, line: Phaser.Display.Color.HexStringToColor(color).color, lineAlpha: 0.62, radius: 24 });
      this.add.image(x + 42, 330, `icon-${icon}`).setDisplaySize(40, 40);
      this.add.text(x + 124, 306, label, { fontFamily: 'Arial Black', fontSize: 18, color: MUTED }).setOrigin(0.5);
      this.add.text(x + 124, 348, value, { fontFamily: 'Arial Black', fontSize: 23, color }).setOrigin(0.5);
      this.tweens.add({ targets: card, alpha: { from: 0.3, to: 1 }, scaleX: { from: 0.96, to: 1 }, scaleY: { from: 0.96, to: 1 }, duration: 240, delay: index * 70, ease: 'Back.Out' });
    });

    this.add.text(640, 438, compactMission(this.currentStage.mission), { fontFamily: 'Arial Black', fontSize: 28, color: GOLD, align: 'center', wordWrap: { width: 760 } }).setOrigin(0.5);
    this.add.text(640, 475, '鏡を回してゴールへ。小ボーナスは右下に表示。', { fontFamily: 'Arial Black', fontSize: 20, color: CYAN, align: 'center' }).setOrigin(0.5);
    const start = this.ui.pill(445, 536, 'START', { bg: 0xff75d8, fg: '#061022', width: 390, height: 54, fontSize: 25, line: 0xffffff });
    // プレイヤー表記を絶対座標Tweenしないようにします。
    // 以前はy=0へ移動して、P1/P2/P3/P4が画面上端からはみ出していました。
    this.tweens.add({
      targets: [panel, playerText, start],
      alpha: { from: 0.2, to: 1 },
      scaleX: { from: 0.96, to: 1 },
      scaleY: { from: 0.96, to: 1 },
      duration: 320,
      ease: 'Back.Out',
    });
  }

function showHandoff(){
    // 交代時は盤面を残し、小さいポップアップだけを重ねます。
    // 全画面停止を避け、プレイヤー交代のテンポを軽くします。
    this.drawPlaying();
    const { player, scoring, cleared } = this.lastResult;
    const playerColor = PLAYER_COLORS[player.index];
    const resultTitle = cleared ? 'CLEAR!' : (this.remaining <= 0 ? 'TIME UP' : 'MOVE END');
    const nextLabel = this.getNextLabel();

    const overlay = this.add.graphics();
    overlay.fillStyle(0x020513, 0.38).fillRect(0, 0, 1280, 720);
    const panel = this.ui.panel(360, 218, 560, 252, {
      fill: PANEL,
      alpha: 0.96,
      line: Phaser.Display.Color.HexStringToColor(playerColor).color,
      lineAlpha: 0.9,
      lineWidth: 5,
      radius: 30,
    });

    const title = this.add.text(640, 268, resultTitle, {
      fontFamily: 'Arial Black',
      fontSize: 54,
      color: cleared ? CYAN : GOLD,
      stroke: '#050718',
      strokeThickness: 9,
    }).setOrigin(0.5);
    this.add.text(640, 326, `${PLAYER_NAMES[player.index]}  +${formatScore(scoring.score)}点`, {
      fontFamily: 'Arial Black',
      fontSize: 33,
      color: '#ffffff',
    }).setOrigin(0.5);
    this.add.text(640, 374, nextLabel, {
      fontFamily: 'Arial Black',
      fontSize: 22,
      color: CYAN,
    }).setOrigin(0.5);
    this.ui.pill(510, 414, '', { bg: 0xffe66d, fg: '#061022', width: 260, height: 44, fontSize: 20, line: 0xffffff });
    const countdownText = this.add.text(640, 436, 'AUTO NEXT 3', {
      fontFamily: 'Arial Black',
      fontSize: 20,
      color: '#061022',
    }).setOrigin(0.5);
    this.tweens.add({ targets: countdownText, scaleX: 1.06, scaleY: 1.06, duration: 280, yoyo: true, repeat: 2, ease: 'Sine.easeInOut' });
    this.handoffExpiresAt = this.time.now + 1350;
    this.handoffAutoCall?.remove(false);
    this.handoffAutoCall = this.time.delayedCall(1350, () => {
      if (this.mode === 'handoff') this.nextTurn();
    });
    this.time.delayedCall(450, () => {
      if (this.mode === 'handoff') countdownText.setText('AUTO NEXT 2');
    });
    this.time.delayedCall(900, () => {
      if (this.mode === 'handoff') countdownText.setText('AUTO NEXT 1');
    });

    if (cleared) {
      this.addClearBurst();
      this.effects?.addRouteReplay?.(this.currentResult?.lines ?? []);
    }
    this.tweens.add({ targets: [panel, title], scaleX: { from: 0.94, to: 1 }, scaleY: { from: 0.94, to: 1 }, alpha: { from: 0.35, to: 1 }, duration: 240, ease: 'Back.Out' });
  }

function getNextLabel(){
    return this.turnManager.getNextLabel(PLAYER_NAMES);
  }
