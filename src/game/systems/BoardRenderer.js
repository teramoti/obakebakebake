/**
 * 盤面の描画を担当するRendererです。
 * セル、鏡、ライト、ゴール、光線、ボーナス表示など、ゲーム中に見える盤面要素を描きます。
 */
import { BOARD } from '../data/gameConfig.js';
import { CYAN, PINK, cellCenter, rectCell } from './sceneUiHelpers.js';
import { LIGHT_COLOR_HEX } from './ColorPuzzleDirector.js';

/**
 * BoardRenderer owns board, icons, mirrors and beam drawing.
 * MirrorPartyScene keeps progression logic and calls this class for visuals.
 */
export default class BoardRenderer {
  // Sceneの状態を参照して盤面を描くため、Phaser Sceneを保持します。
  constructor(scene) {
    this.scene = scene;
    // 既存の盤面描画処理がScene経由で呼ぶため、互換用にSceneへ補助関数を渡します。
    this.scene.drawIconObject = drawIconObject.bind(scene);
    this.scene.drawCrystal = drawCrystal.bind(scene);
    this.scene.drawGhost = drawGhost.bind(scene);
    this.scene.drawWall = drawWall.bind(scene);
    this.scene.drawPortal = drawPortal.bind(scene);
    this.scene.drawMirror = drawMirror.bind(scene);
    this.scene.drawRouteMarker = drawRouteMarker.bind(scene);
    this.scene.drawSpotlightTarget = drawSpotlightTarget.bind(scene);
    this.scene.drawDangerTarget = drawDangerTarget.bind(scene);
    this.scene.drawMovingGoal = drawMovingGoal.bind(scene);
    this.scene.drawChaserGhost = drawChaserGhost.bind(scene);
    this.scene.drawSplitter = drawSplitter.bind(scene);
  }

  // セル、鏡、ライト、ゴール、ギミック、光線をまとめて描画します。
  drawBoard() {
    drawBoard.call(this.scene);
  }

  // traceBeamの線分を色ごとに光線として描画します。
  drawBeam() {
    drawBeam.call(this.scene);
  }
}

function drawBoard(){
    const g = this.add.graphics();
    g.fillStyle(0x0c1028, 0.92).fillRoundedRect(BOARD.x - 18, BOARD.y - 18, BOARD.cell * BOARD.cols + 36, BOARD.cell * BOARD.rows + 36, 28);
    g.lineStyle(4, 0x6ee7ff, 0.5).strokeRoundedRect(BOARD.x - 18, BOARD.y - 18, BOARD.cell * BOARD.cols + 36, BOARD.cell * BOARD.rows + 36, 28);

    for (let y = 0; y < BOARD.rows; y += 1) {
      for (let x = 0; x < BOARD.cols; x += 1) {
        const px = BOARD.x + x * BOARD.cell;
        const py = BOARD.y + y * BOARD.cell;
        g.fillStyle((x + y) % 2 === 0 ? 0x111936 : 0x0b1230, 1);
        g.fillRoundedRect(px + 3, py + 3, BOARD.cell - 6, BOARD.cell - 6, 10);
        g.lineStyle(1, 0x7b8dff, 0.18).strokeRoundedRect(px + 3, py + 3, BOARD.cell - 6, BOARD.cell - 6, 10);
      }
    }

    this.drawSpotlightTarget();
    this.drawDangerTarget();

    const emitters = this.currentStage.emitters ?? [this.currentStage.emitter];
    emitters.forEach((emitter) => this.drawIconObject(emitter, 'flashlight', emitters.length > 1 ? 36 : 42, LIGHT_COLOR_HEX[emitter.color]));
    this.drawMovingGoal();
    this.currentStage.walls.forEach((wall) => this.drawWall(wall));
    this.currentStage.crystals.forEach((crystal) => this.drawCrystal(crystal));
    this.currentStage.ghosts.forEach((ghost) => this.drawGhost(ghost));
    this.drawChaserGhost();
    this.currentStage.portals.forEach((portal) => this.drawPortal(portal));
    (this.currentStage.splitters ?? []).forEach((splitter) => this.drawSplitter(splitter));
    this.visibleHintKeys = getVisibleHintKeys.call(this);
    this.mirrorStates.forEach((mirror) => this.drawMirror(mirror));
    this.visibleHintKeys = null;
  }


function drawSpotlightTarget(){
    const cell = this.liveTwistManager?.getActiveSpotlight(this.time.now);
    if (!cell) return;
    const center = cellCenter(cell);
    const hit = this.liveTwistManager?.isSpotlightHit(this.currentResult, this.time.now);
    const pulse = 1 + Math.sin(this.time.now / 130) * 0.12;
    const g = this.add.graphics();
    g.fillStyle(hit ? 0xffe66d : 0x6ee7ff, hit ? 0.2 : 0.12).fillCircle(center.x, center.y, 34 * pulse);
    g.lineStyle(hit ? 5 : 3, hit ? 0xffe66d : 0x6ee7ff, hit ? 0.95 : 0.72).strokeCircle(center.x, center.y, 30 * pulse);
    if (this.textures.exists('icon-ui-spotlight')) {
      this.add.image(center.x, center.y, 'icon-ui-spotlight').setDisplaySize(hit ? 30 : 24, hit ? 30 : 24).setAlpha(hit ? 1 : 0.78);
    }
  }


function drawDangerTarget(){
    const cell = this.liveTwistManager?.getActiveDanger(this.time.now);
    if (!cell) return;
    const center = cellCenter(cell);
    const hit = this.liveTwistManager?.isDangerHit(this.currentResult, this.time.now);
    const pulse = 1 + Math.sin(this.time.now / 110) * 0.14;
    const g = this.add.graphics();
    g.fillStyle(0xff75d8, hit ? 0.22 : 0.1).fillCircle(center.x, center.y, 31 * pulse);
    g.lineStyle(hit ? 5 : 3, 0xff75d8, hit ? 0.95 : 0.64).strokeCircle(center.x, center.y, 27 * pulse);
    if (this.textures.exists('icon-warning-ghost')) {
      this.add.image(center.x, center.y, 'icon-warning-ghost').setDisplaySize(hit ? 30 : 24, hit ? 30 : 24).setAlpha(hit ? 1 : 0.76);
    }
  }



function drawMovingGoal(){
    const goals = this.currentStage.goals ?? [this.currentStage.goal];
    const bonusGate = this.currentResult?.bonusGate;
    const isMoving = this.currentResult?.movingGoal;
    const reached = this.currentResult?.reachedGoal;
    const pulse = 1 + Math.sin(this.time.now / 120) * 0.12;
    const g = this.add.graphics();
    goals.forEach((goal) => {
      const center = cellCenter(goal);
      const goalHit = this.currentResult?.matchedGoalIds?.includes(goal.id);
      const wrongGoalHit = this.currentResult?.wrongGoalCells?.some((cell) => cell.x === goal.x && cell.y === goal.y);
      const color = LIGHT_COLOR_HEX[goal.color] ?? 0x6ee7ff;
      const ringColor = wrongGoalHit ? 0xff75d8 : (goalHit ? color : 0x6ee7ff);
      g.fillStyle(ringColor, goalHit ? 0.2 : (wrongGoalHit ? 0.18 : 0.08)).fillCircle(center.x, center.y, 35 * pulse);
      g.lineStyle(goalHit || wrongGoalHit ? 5 : 3, ringColor, goalHit || wrongGoalHit ? 0.95 : 0.58).strokeCircle(center.x, center.y, 32 * pulse);
      if (wrongGoalHit) {
        this.add.text(center.x, center.y - 34, '色ちがい', { fontFamily: 'Arial Black', fontSize: 12, color: '#ffb4ea', stroke: '#02040e', strokeThickness: 4 }).setOrigin(0.5);
      }
      this.drawIconObject(goal, 'target-door', goals.length > 1 ? 34 : 42, color);
      if (goals.length > 1) {
        this.add.text(center.x, center.y + 29, goal.label ?? '', { fontFamily: 'Arial Black', fontSize: 12, color: '#ffffff', stroke: '#02040e', strokeThickness: 4 }).setOrigin(0.5);
      }
    });
    if (bonusGate) {
      const bonusCenter = cellCenter(bonusGate);
      const bonusPulse = 1 + Math.sin(this.time.now / 120) * 0.12;
      g.fillStyle(0xffe66d, isMoving ? 0.2 : 0.1).fillCircle(bonusCenter.x, bonusCenter.y, 30 * bonusPulse);
      g.lineStyle(isMoving ? 5 : 3, 0xffe66d, isMoving ? 0.95 : 0.64).strokeCircle(bonusCenter.x, bonusCenter.y, 27 * bonusPulse);
      this.drawIconObject(bonusGate, 'round-ticket', isMoving ? 34 : 30);
    }
  }

function drawChaserGhost(){
    const chaser = this.currentResult?.activeChaser ?? this.movingBoardDirector?.getActiveChaser(this.time.now);
    if (!chaser) return;
    const center = cellCenter(chaser);
    const hit = this.currentResult?.chaserHit;
    const pulse = 1 + Math.sin(this.time.now / 100) * 0.14;
    const g = this.add.graphics();
    g.fillStyle(0xff75d8, hit ? 0.2 : 0.09).fillCircle(center.x, center.y, 33 * pulse);
    g.lineStyle(hit ? 4 : 3, 0xff75d8, hit ? 0.88 : 0.6).strokeCircle(center.x, center.y, 29 * pulse);
    this.drawIconObject(chaser, 'ghost', hit ? 38 : 32);
  }

function drawIconObject(cell, iconKey, size = 40, tint = null){
    const center = cellCenter(cell);
    const texture = `icon-${iconKey}`;
    if (this.textures.exists(texture)) {
      const image = this.add.image(center.x, center.y, texture).setDisplaySize(size, size);
      if (tint) image.setTint(tint);
      return;
    }

    this.add.text(center.x, center.y, iconKey.slice(0, 2).toUpperCase(), {
      fontFamily: 'Arial Black',
      fontSize: 18,
      color: '#ffffff',
      stroke: '#02040e',
      strokeThickness: 4,
    }).setOrigin(0.5);
  }

function drawCrystal(cell){
    const center = cellCenter(cell);
    const g = this.add.graphics();
    const collected = this.currentResult?.cells?.some((beamCell) => beamCell.x === cell.x && beamCell.y === cell.y);
    if (collected) {
      g.fillStyle(0x83fffd, 0.18).fillCircle(center.x, center.y, 32);
      g.lineStyle(4, 0x83fffd, 0.9).strokeCircle(center.x, center.y, 32);
      this.add.text(center.x, center.y - 36, '+1', { fontFamily: 'Arial Black', fontSize: 13, color: CYAN, stroke: '#02040e', strokeThickness: 4 }).setOrigin(0.5);
    }
    this.drawIconObject(cell, 'crystal', 38);
  }

function drawGhost(cell){
    const center = cellCenter(cell);
    const g = this.add.graphics();
    const hit = this.currentResult?.cells?.some((beamCell) => beamCell.x === cell.x && beamCell.y === cell.y);
    if (hit) {
      g.fillStyle(0xff75d8, 0.16).fillCircle(center.x, center.y, 34);
      g.lineStyle(4, 0xff75d8, 0.9).strokeCircle(center.x, center.y, 34);
      this.add.text(center.x, center.y - 38, '-1', { fontFamily: 'Arial Black', fontSize: 13, color: PINK, stroke: '#02040e', strokeThickness: 4 }).setOrigin(0.5);
    }
    this.drawIconObject(cell, 'ghost', 40);
  }

function drawWall(cell){
    const position = rectCell(cell);
    const g = this.add.graphics();
    g.fillStyle(0x26305e, 0.95).fillRoundedRect(position.x + 8, position.y + 8, BOARD.cell - 16, BOARD.cell - 16, 10);
    g.lineStyle(2, 0xb9c8ff, 0.32).strokeRoundedRect(position.x + 8, position.y + 8, BOARD.cell - 16, BOARD.cell - 16, 10);
    this.drawIconObject(cell, 'wall', 34);
  }

function drawPortal(cell){
    const center = cellCenter(cell);
    const g = this.add.graphics();
    g.lineStyle(5, 0xff75d8, 0.95).strokeCircle(center.x, center.y, 21);
    g.lineStyle(3, 0x6ee7ff, 0.7).strokeCircle(center.x, center.y, 13);
    this.drawIconObject(cell, 'portal', 36);
  }


function drawSplitter(cell){
    const center = cellCenter(cell);
    const g = this.add.graphics();
    const hit = this.currentResult?.cells?.some((beamCell) => beamCell.x === cell.x && beamCell.y === cell.y);
    const pulse = 1 + Math.sin(this.time.now / 130) * 0.12;
    g.fillStyle(0xffe66d, hit ? 0.18 : 0.08).fillCircle(center.x, center.y, 31 * pulse);
    g.lineStyle(hit ? 5 : 3, 0xffe66d, hit ? 0.9 : 0.58).strokeCircle(center.x, center.y, 28 * pulse);
    this.add.text(center.x, center.y, 'Y', {
      fontFamily: 'Arial Black',
      fontSize: 25,
      color: '#ffe66d',
      stroke: '#02040e',
      strokeThickness: 5,
    }).setOrigin(0.5);
  }


function mirrorKey(mirror){
    return `${mirror.x},${mirror.y}`;
  }

function getVisibleHintKeys(){
    if (!this.currentResult || this.remaining > this.stageSeconds * 0.42) return new Set();
    const beamCells = new Set((this.currentResult.cells ?? []).map((cell) => `${cell.x},${cell.y}`));
    const candidates = this.mirrorStates
      .filter((mirror) => mirror.solutionType && mirror.type !== mirror.solutionType && beamCells.has(mirrorKey(mirror)))
      .slice(0, 2)
      .map(mirrorKey);
    return new Set(candidates);
  }

function drawMirror(mirror){
    const center = cellCenter(mirror);
    const g = this.add.graphics();
    const isOnCurrentBeam = this.currentResult?.cells?.some((cell) => cell.x === mirror.x && cell.y === mirror.y);
    const wantsHint = this.visibleHintKeys?.has(`${mirror.x},${mirror.y}`) ?? false;

    if (wantsHint) {
      g.fillStyle(0xffe66d, 0.16).fillCircle(center.x, center.y, 34);
      g.lineStyle(4, 0xffe66d, 0.95).strokeCircle(center.x, center.y, 34);
      this.add.text(center.x, center.y - 37, 'HINT', {
        fontFamily: 'Arial Black',
        fontSize: 13,
        color: '#ffe66d',
        stroke: '#02040e',
        strokeThickness: 4,
      }).setOrigin(0.5);
    }

    g.fillStyle(mirror.locked ? 0xffe66d : (isOnCurrentBeam ? 0x6ee7ff : 0xffffff), mirror.locked ? 0.12 : (isOnCurrentBeam ? 0.16 : 0.1)).fillCircle(center.x, center.y, 28);
    g.lineStyle(9, mirror.locked ? 0xffe66d : (wantsHint ? 0xffe66d : 0xffffff), 0.98);
    if (mirror.type === '/') {
      g.beginPath().moveTo(center.x + 19, center.y - 19).lineTo(center.x - 19, center.y + 19).strokePath();
    } else {
      g.beginPath().moveTo(center.x - 19, center.y - 19).lineTo(center.x + 19, center.y + 19).strokePath();
    }
    g.lineStyle(2, mirror.locked ? 0xffe66d : (wantsHint ? 0xffe66d : 0x6ee7ff), 0.8).strokeCircle(center.x, center.y, 25);
    const marker = mirror.locked ? '固' : '↻';
    this.add.text(center.x, center.y + 31, marker, {
      fontFamily: 'Arial Black',
      fontSize: mirror.locked ? 11 : 16,
      color: mirror.locked ? '#ffe66d' : (wantsHint ? '#ffe66d' : '#6ee7ff'),
      stroke: '#02040e',
      strokeThickness: 4,
    }).setOrigin(0.5);
  }


function clampBeamPoint(point){
    const center = cellCenter(point);
    const minX = BOARD.x + BOARD.cell / 2;
    const minY = BOARD.y + BOARD.cell / 2;
    const maxX = BOARD.x + BOARD.cell * BOARD.cols - BOARD.cell / 2;
    const maxY = BOARD.y + BOARD.cell * BOARD.rows - BOARD.cell / 2;
    return {
      x: Math.max(minX, Math.min(maxX, center.x)),
      y: Math.max(minY, Math.min(maxY, center.y)),
    };
  }


function beamOffsetFor(line){
    const sourceNumber = Number(String(line.sourceId ?? '').replace(/\D/g, '')) || 1;
    return (sourceNumber - 2) * 6;
  }

function offsetBeamPoints(from, to, line){
    const offset = beamOffsetFor(line);
    if (offset === 0) return { from, to };
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy) || 1;
    const ox = (-dy / length) * offset;
    const oy = (dx / length) * offset;
    return {
      from: { x: from.x + ox, y: from.y + oy },
      to: { x: to.x + ox, y: to.y + oy },
    };
  }

function drawBeam(){
    if (!this.currentResult) return;

    const g = this.add.graphics();
    this.currentResult.lines.forEach((line) => {
      const color = LIGHT_COLOR_HEX[line.color] ?? 0x83fffd;
      const rawFrom = clampBeamPoint(line.from);
      const rawTo = clampBeamPoint(line.to);
      const { from, to } = offsetBeamPoints(rawFrom, rawTo, line);
      g.lineStyle(10, color, 0.12).beginPath().moveTo(from.x, from.y).lineTo(to.x, to.y).strokePath();
    });
    this.currentResult.lines.forEach((line) => {
      const color = LIGHT_COLOR_HEX[line.color] ?? 0x83fffd;
      const rawFrom = clampBeamPoint(line.from);
      const rawTo = clampBeamPoint(line.to);
      const { from, to } = offsetBeamPoints(rawFrom, rawTo, line);
      g.lineStyle(5, color, 0.86).beginPath().moveTo(from.x, from.y).lineTo(to.x, to.y).strokePath();
    });

    this.drawRouteMarker();
  }

function drawRouteMarker(){
    if (!this.currentResult?.lines?.length) return;
    const lines = this.currentResult.lines;
    const index = Math.floor((this.time.now / 160) % lines.length);
    const line = lines[index];
    const from = clampBeamPoint(line.from);
    const to = clampBeamPoint(line.to);
    const t = ((this.time.now % 160) / 160);
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - from.y) * t;
    const pulse = 1 + Math.sin(this.time.now / 90) * 0.18;
    const color = LIGHT_COLOR_HEX[line.color] ?? 0x6ee7ff;
    const dot = this.add.circle(x, y, 8 * pulse, this.remaining <= 8 ? 0xffe66d : 0xffffff, 0.96);
    dot.setStrokeStyle(4, color, 0.7);
    this.add.circle(x, y, 22 * pulse, color, 0.16);
  }
