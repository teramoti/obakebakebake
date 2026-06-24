/**
 * Phaser側のメインSceneです。
 * 入力、ターン進行、スコア確定、画面遷移を管理し、描画や演出は各Renderer/Directorへ委譲します。
 */
import Phaser from 'phaser';
import { STAGES } from '../data/stages.js';
import { BOARD, DIFFICULTY_SETTINGS, ROUND_EVENTS, applyBoardLayout } from '../data/gameConfig.js';
import TurnManager from '../systems/TurnManager.js';
import TurnResultContext from '../systems/TurnResultContext.js';
import GameAudio from '../systems/GameAudio.js';
import { calculateScore, createEmptyPlayer } from '../systems/scoreSystem.js';
import MoveLimitManager from '../systems/MoveLimitManager.js';
import ScoreLedger from '../systems/ScoreLedger.js';
import ResultAwardFactory from '../systems/ResultAwardFactory.js';
import { cloneMirrors, toggleMirrorType, traceBeam } from '../systems/beamSystem.js';
import ArcadeUiKit from '../systems/ArcadeUiKit.js';
import { audioUrl, iconUrl } from '../data/resourcePaths.js';
import BoardRenderer from '../systems/BoardRenderer.js';
import HudRenderer from '../systems/HudRenderer.js';
import FlowScreenRenderer from '../systems/FlowScreenRenderer.js';
import ResultScreenRenderer from '../systems/ResultScreenRenderer.js';
import SceneEffects from '../systems/SceneEffects.js';
import { ICON_KEYS } from '../systems/sceneUiHelpers.js';
import GimmickDirector from '../systems/GimmickDirector.js';
import LiveTwistManager from '../systems/LiveTwistManager.js';
import MovingBoardDirector from '../systems/MovingBoardDirector.js';
import FunnyMomentDirector from '../systems/FunnyMomentDirector.js';
import { createGameResultPayload } from '../systems/GameResultFactory.js';
import { enhanceStageForDifficulty } from '../systems/ColorPuzzleDirector.js';
import PuzzleDramaDirector from '../systems/PuzzleDramaDirector.js';
import RoundRuleDirector from '../systems/RoundRuleDirector.js';
import TurnFeedbackDirector from '../systems/TurnFeedbackDirector.js';
export default class MirrorPartyScene extends Phaser.Scene {
  // React側から渡された設定と終了コールバックをScene内へ保持します。
  init(data) {
    this.settings = data.settings;
    this.onFinish = data.onFinish;
  }
  // PNGアイコンとBGM/SEをPhaserのキャッシュへ読み込みます。
  preload() {
    ICON_KEYS.forEach((key) => this.load.image(`icon-${key}`, iconUrl(key)));
    this.load.audio('click', audioUrl('click'));
    this.load.audio('clear', audioUrl('clear'));
    this.load.audio('ghost', audioUrl('ghost'));
    this.load.audio('finish', audioUrl('finish'));
    this.load.audio('start', audioUrl('start'));
    this.load.audio('event', audioUrl('event'));
    this.load.audio('hint', audioUrl('hint'));
    this.load.audio('perfect', audioUrl('perfect'));
    this.load.audio('award', audioUrl('award'));
    this.load.audio('bgm-title', audioUrl('bgm-title'));
    this.load.audio('bgm-play', audioUrl('bgm-play'));
    this.load.audio('bgm-result', audioUrl('bgm-result'));
    this.load.audio('countdown', audioUrl('countdown'));
    this.load.audio('fever', audioUrl('fever'));
    this.load.audio('ranking', audioUrl('ranking'));
  }
  // 難易度、ターン管理、Renderer、Audioなどを初期化してREADY画面へ入ります。
  create() {
    this.difficulty = DIFFICULTY_SETTINGS[this.settings.difficulty] || DIFFICULTY_SETTINGS.normal;
    this.board = applyBoardLayout(this.difficulty.id);
    this.playerCount = this.settings.playerCount || this.settings.players || 4;
    this.roundCount = this.difficulty.roundCount;
    this.stageSeconds = Math.max(5, Math.floor(this.settings.totalSeconds / this.roundCount));
    this.players = Array.from({ length: this.playerCount }, (_, index) => createEmptyPlayer(index));
    this.scoreLedger = new ScoreLedger(this.players);
    this.awardFactory = new ResultAwardFactory(this.players);
    this.moveLimitManager = new MoveLimitManager(this.difficulty.id);
    const stagePool = STAGES.filter((stage) => this.difficulty.stageIds.includes(stage.id));
    this.turnManager = new TurnManager({
      stages: STAGES,
      stagePool,
      roundEvents: ROUND_EVENTS,
      roundCount: this.roundCount,
      playerCount: this.playerCount,
      boardConfig: this.board,
    });
    this.roundStageAssignments = this.turnManager.roundStageAssignments;
    this.roundOrders = this.turnManager.roundOrders;
    this.roundEvents = this.turnManager.roundEvents;
    this.audio = new GameAudio(this);
    this.ui = new ArcadeUiKit(this);
    this.boardRenderer = new BoardRenderer(this);
    this.hudRenderer = new HudRenderer(this);
    this.flowScreens = new FlowScreenRenderer(this);
    this.resultScreen = new ResultScreenRenderer(this);
    this.effects = new SceneEffects(this);
    this.funnyMomentDirector = new FunnyMomentDirector();
    this.puzzleDramaDirector = new PuzzleDramaDirector();
    this.roundRuleDirector = new RoundRuleDirector();
    this.turnFeedbackDirector = new TurnFeedbackDirector();
    this.roundIndex = 0;
    this.orderIndex = 0;
    this.mode = 'ready';
    this.lastResult = null;
    this.currentResult = null;
    this.startTime = 0;
    this.remaining = this.stageSeconds;
    this.turnRotations = 0;
    this.scorePops = [];
    this.maxMoves = 0;
    this.showHelpOverlay = false;
    this.turnClosing = false;
    this.helpPageIndex = 0;
    this.lastCountdownSecond = null;
    this.feverPlayed = false;
    this.reactionText = '';
    this.reactionBorn = 0;
    this.currentDramaState = null;
    this.currentRoundRule = null;
    this.currentRoundRuleState = null;
    this.handoffAutoCall = null;
    this.handoffExpiresAt = 0;
    this.input.on('pointerdown', (pointer) => this.handlePointer(pointer));
    this.input.keyboard.on('keydown-SPACE', () => this.handleSpace());
    this.input.keyboard.on('keydown-H', () => {
      if (this.mode !== 'playing') return;
      this.showHelpOverlay = !this.showHelpOverlay;
      if (this.showHelpOverlay) this.helpPageIndex = 0;
      this.drawPlaying();
    });
    this.input.keyboard.on('keydown-LEFT', () => this.hudRenderer.changeHelpPage(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.hudRenderer.changeHelpPage(1));
    this.input.keyboard.on('keydown-ESC', () => this.finishGame());
    this.audio.playStart();
    this.showReadyScreen();
  }
  // プレイ中だけ毎フレーム残り時間・光線・自動CLEAR判定を更新します。
  update() {
    if (this.mode !== 'playing') return;
    const elapsed = (this.time.now - this.startTime) / 1000;
    this.remaining = Math.max(0, this.stageSeconds - elapsed);
    const feverWindow = Math.min(8, Math.floor(this.stageSeconds * 0.42));
    const secondsLeft = Math.ceil(this.remaining);
    if (!this.feverPlayed && this.remaining <= feverWindow) {
      this.feverPlayed = true;
      this.audio.playFever();
    }
    if (secondsLeft > 0 && secondsLeft <= 3 && secondsLeft !== this.lastCountdownSecond) {
      this.lastCountdownSecond = secondsLeft;
      this.audio.playCountdown();
    }
    if (this.remaining <= 0) {
      this.finishTurn(false);
      return;
    }
    if (Math.floor(this.time.now / 100) !== this.lastHudTick) {
      this.lastHudTick = Math.floor(this.time.now / 100);
      this.updateBeam();
      this.drawPlaying();
      if (!this.turnClosing && this.currentResult.reachedGoal) {
        this.lockTurnAndFinish(240, true);
      }
    }
  }
  handleSpace() {
    if (this.mode === 'ready') this.showTurnIntro();
    else if (this.mode === 'intro') this.startTurn();
    else if (this.mode === 'handoff') this.nextTurn();
    else if (this.mode === 'result') this.finishGame();
  }
  handlePointer(pointer) {
    if (this.mode === 'ready') {
      this.showTurnIntro();
      return;
    }
    if (this.mode === 'intro') {
      this.startTurn();
      return;
    }
    if (this.mode === 'handoff') {
      this.nextTurn();
      return;
    }
    if (this.mode === 'result') {
      if (pointer.x >= 540 && pointer.x <= 740 && pointer.y >= 590 && pointer.y <= 642) {
        this.finishGame();
      }
      return;
    }
    if (this.mode !== 'playing' || this.turnClosing || this.showHelpOverlay) return;
    const gridX = Math.floor((pointer.x - BOARD.x) / BOARD.cell);
    const gridY = Math.floor((pointer.y - BOARD.y) / BOARD.cell);
    if (gridX < 0 || gridY < 0 || gridX >= BOARD.cols || gridY >= BOARD.rows) return;
    const mirror = this.mirrorStates.find((item) => item.x === gridX && item.y === gridY);
    if (!mirror) return;
    if (mirror.locked) {
      this.audio.playHint();
      this.scorePops.push({ x: pointer.x, y: pointer.y, text: '固定', born: this.time.now });
      this.reactionText = '固定ミラー!';
      this.reactionBorn = this.time.now;
      this.drawPlaying();
      return;
    }
    if (this.moveLimitManager.isOutOfMoves(this.turnRotations, this.maxMoves)) {
      this.finishTurn(false);
      return;
    }
    mirror.type = toggleMirrorType(mirror.type);
    this.turnRotations += 1;
    this.audio.playClick();
    this.scorePops.push({ x: pointer.x, y: pointer.y, text: '回転', born: this.time.now });
    this.updateBeam();
    this.reactionText = this.turnFeedbackDirector.applyClickFeedback({ scene: this, pointer });
    this.reactionBorn = this.time.now;
    this.drawPlaying();
    if (this.currentResult.reachedGoal) {
      this.lockTurnAndFinish(300, true);
    } else if (this.moveLimitManager.isOutOfMoves(this.turnRotations, this.maxMoves)) {
      this.lockTurnAndFinish(220, false);
    }
  }
  prepareStage(stage) {
    return enhanceStageForDifficulty(stage, this.difficulty.id, this.board);
  }
  startTurn() {
    this.handoffAutoCall?.remove(false);
    this.handoffAutoCall = null;
    this.handoffExpiresAt = 0;
    this.mode = 'playing';
    this.audio.playBgm('bgm-play', 0.1);
    const turn = this.turnManager.getCurrentTurn();
    this.currentEvent = turn.event;
    this.currentPlayerIndex = turn.playerIndex;
    this.currentStage = enhanceStageForDifficulty(turn.stage, this.difficulty.id, this.board);
    this.currentRoundRule = this.roundRuleDirector.getRule({
      roundIndex: this.roundIndex,
      difficultyId: this.difficulty.id,
      stage: this.currentStage,
    });
    this.currentRoundRuleState = null;
    this.mirrorStates = cloneMirrors(this.currentStage);
    this.gimmickDirector = new GimmickDirector(this.currentEvent);
    this.liveTwistManager = new LiveTwistManager();
    this.liveTwistManager.startTurn({
      stage: this.currentStage,
      roundIndex: this.roundIndex,
      playerIndex: this.currentPlayerIndex,
      event: this.currentEvent,
    });
    this.movingBoardDirector = new MovingBoardDirector();
    this.movingBoardDirector.startTurn({
      stage: this.currentStage,
      mirrorStates: this.mirrorStates,
      roundIndex: this.roundIndex,
      playerIndex: this.currentPlayerIndex,
      event: this.currentEvent,
    });
    this.maxMoves = this.moveLimitManager.getMaxMoves(this.currentStage, this.gimmickDirector.getMoveBonus());
    this.turnRotations = 0;
    this.startTime = this.time.now;
    this.remaining = this.stageSeconds;
    this.scorePops = [];
    this.turnClosing = false;
    this.showHelpOverlay = false;
    this.helpPageIndex = 0;
    this.lastCountdownSecond = null;
    this.feverPlayed = false;
    this.reactionText = '鏡をクリック!';
    this.reactionBorn = this.time.now;
    this.currentDramaState = null;
    this.updateBeam();
    this.drawPlaying();
  }
  nextTurn() {
    this.handoffAutoCall?.remove(false);
    this.handoffAutoCall = null;
    this.handoffExpiresAt = 0;
    if (!this.turnManager.advance()) {
      this.finishGame();
      return;
    }
    this.roundIndex = this.turnManager.roundIndex;
    this.orderIndex = this.turnManager.orderIndex;
    this.startTurn();
  }
  updateBeam() {
    const traceStage = this.movingBoardDirector
      ? this.movingBoardDirector.createTraceStage(this.currentStage, this.time.now)
      : this.currentStage;
    const traced = traceBeam(traceStage, this.mirrorStates, this.board);
    this.currentResult = this.movingBoardDirector
      ? this.movingBoardDirector.applyDynamicResult({
        stage: this.currentStage,
        result: traced,
        now: this.time.now,
      })
      : traced;
    this.currentDramaState = this.puzzleDramaDirector?.evaluate({
      result: this.currentResult,
      rotations: this.turnRotations,
      maxMoves: this.maxMoves,
      cleared: this.currentResult?.reachedGoal ?? false,
    }) ?? null;
    this.currentRoundRuleState = this.roundRuleDirector?.evaluate({
      rule: this.currentRoundRule,
      result: this.currentResult,
      rotations: this.turnRotations,
      maxMoves: this.maxMoves,
      cleared: this.currentResult?.reachedGoal ?? false,
    }) ?? null;
  }
  lockTurnAndFinish(delayMs, cleared) {
    if (this.turnClosing) return;
    this.turnClosing = true;
    this.time.delayedCall(delayMs, () => this.finishTurn(cleared));
  }
  finishTurn(cleared) {
    if (this.mode !== 'playing' && !this.turnClosing) return;
    this.mode = 'handoff';
    this.turnClosing = false;
    const elapsed = (this.time.now - this.startTime) / 1000;
    const liveRanking = [...this.players].sort((a, b) => b.totalScore - a.totalScore);
    const rankIndex = liveRanking.findIndex((item) => item.index === this.currentPlayerIndex);
    const resultContext = TurnResultContext.create(this.currentResult);
    const liveScore = this.liveTwistManager?.getLiveScore({
      result: resultContext.scoreResult,
      now: this.time.now,
      cleared,
    }) ?? { value: 0, spot: false, danger: false, combo: false };
    const boardScore = this.movingBoardDirector?.getDynamicScore({
      result: resultContext.scoreResult,
      cleared,
    }) ?? { value: 0, movingGoal: false, chaserHit: false, ghostAvoided: false };
    const dramaState = this.puzzleDramaDirector.evaluate({
      result: resultContext.scoreResult,
      rotations: this.turnRotations,
      maxMoves: this.maxMoves,
      cleared,
    });
    const ruleState = this.roundRuleDirector.evaluate({
      rule: this.currentRoundRule,
      result: resultContext.scoreResult,
      rotations: this.turnRotations,
      maxMoves: this.maxMoves,
      cleared,
    });
    const liveBonus = liveScore.value + boardScore.value + dramaState.bonus;
    const scoring = calculateScore({
      stage: this.currentStage,
      result: resultContext.scoreResult,
      rotations: this.turnRotations,
      remaining: this.remaining,
      elapsed,
      stageSeconds: this.stageSeconds,
      cleared,
      event: this.currentEvent,
      rankIndex,
      maxMoves: this.maxMoves,
      liveBonus,
      roundRuleBonus: ruleState.bonus,
    });
    const player = this.scoreLedger.applyTurn({
      playerIndex: this.currentPlayerIndex,
      stage: this.currentStage,
      roundIndex: this.roundIndex,
      currentResult: this.currentResult,
      resultContext,
      scoring,
      cleared,
      rotations: this.turnRotations,
      maxMoves: this.maxMoves,
      remaining: this.remaining,
      event: this.currentEvent,
    });
    this.lastResult = { player, scoring, cleared, resultContext, liveScore, boardScore, dramaState, ruleState, roundRule: this.currentRoundRule };
    if (cleared) this.audio.playClear();
    else this.audio.playFinish();
    if (scoring.isPerfect) this.audio.playPerfect();
    if (this.currentResult.ghosts > 0 || this.currentResult.chaserHit) this.audio.playGhost();
    this.showHandoff();
  }
  finishGame() {
    this.handoffAutoCall?.remove(false);
    this.handoffAutoCall = null;
    this.audio?.stopBgm?.();
    this.onFinish?.(createGameResultPayload({
      scoreLedger: this.scoreLedger,
      settings: this.settings,
      roundCount: this.roundCount,
    }));
  }
  drawBackground() {
    const g = this.add.graphics();
    g.fillGradientStyle(0x060716, 0x060716, 0x111a3c, 0x25123d, 1);
    g.fillRect(0, 0, 1280, 720);
    for (let i = 0; i < 60; i += 1) {
      const x = (i * 97) % 1280;
      const y = (i * 53) % 720;
      g.fillStyle(i % 3 === 0 ? 0x6ee7ff : 0xfff4a3, 0.16);
      g.fillCircle(x, y, (i % 4) + 1.2);
    }
  }
  clearScreen() {
    this.children.removeAll(true);
  }
  drawPlaying() {
    this.clearScreen();
    this.drawBackground();
    this.boardRenderer.drawBoard();
    this.boardRenderer.drawBeam();
    this.hudRenderer.drawHud();
    this.hudRenderer.drawGimmickBadges();
    this.hudRenderer.drawReactionBanner();
    this.hudRenderer.drawScorePops();
    if (this.showHelpOverlay) this.hudRenderer.drawHelpOverlay();
  }
  // 最初の待機画面を表示します。
  showReadyScreen() { this.flowScreens.showReadyScreen(); }
  // 現在プレイヤーのターン開始前説明を表示します。
  showTurnIntro() { this.flowScreens.showTurnIntro(); }
  // 交代ポップアップを表示し、自動カウントダウンで次ターンへ進めます。
  showHandoff() { this.flowScreens.showHandoff(); }
  getNextLabel() { return this.flowScreens.getNextLabel(); }
  // Phaser内Result演出を表示します。React側Resultにも同じ結果を返します。
  showResult() { this.resultScreen.showResult(); }
  addConfettiRain() { this.effects.addConfettiRain(); }
  addClearBurst() { this.effects.addClearBurst(); }
}
