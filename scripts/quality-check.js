import { STAGES, GRID_SIZE } from '../src/game/data/stages.js';
import { BOARD_LAYOUTS, DIFFICULTY_SETTINGS, ROUND_EVENTS } from '../src/game/data/gameConfig.js';
import { cloneMirrors, traceBeam } from '../src/game/systems/beamSystem.js';
import { remixStageForPlayer } from '../src/game/systems/stageRemix.js';
import { calculateScore } from '../src/game/systems/scoreSystem.js';
import TurnManager from '../src/game/systems/TurnManager.js';
import MoveLimitManager from '../src/game/systems/MoveLimitManager.js';
import ScoreLedger from '../src/game/systems/ScoreLedger.js';
import TurnResultContext from '../src/game/systems/TurnResultContext.js';
import { createEmptyPlayer } from '../src/game/systems/scoreSystem.js';
import LiveTwistManager from '../src/game/systems/LiveTwistManager.js';
import MovingBoardDirector from '../src/game/systems/MovingBoardDirector.js';
import { enhanceStageForDifficulty } from '../src/game/systems/ColorPuzzleDirector.js';
import { readFileSync } from 'node:fs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function verifyStage(stage, label, boardConfig = { cols: GRID_SIZE, rows: GRID_SIZE }) {
  const initial = traceBeam(stage, cloneMirrors(stage), boardConfig);
  assert(!initial.reachedGoal, `${label}: initial state should not clear immediately`);

  const solutionMirrors = stage.mirrors.map((mirror) => ({ ...mirror, type: mirror.solutionType ?? mirror.type }));
  const solved = traceBeam(stage, solutionMirrors, boardConfig);
  assert(solved.reachedGoal, `${label}: solutionType should reach goal`);
}

function verifyStages() {
  STAGES.forEach((stage) => verifyStage(stage, stage.id));

  Object.values(DIFFICULTY_SETTINGS).forEach((difficulty) => {
    const boardConfig = BOARD_LAYOUTS[difficulty.id];
    STAGES.forEach((stage) => {
      for (let round = 0; round < difficulty.roundCount; round += 1) {
        for (let player = 0; player < 4; player += 1) {
          const remix = remixStageForPlayer(stage, round, player, boardConfig);
          verifyStage(remix, remix.id, boardConfig);
        }
      }
    });
  });
}

function verifySimpleScoring() {
  const stage = STAGES.find((item) => item.crystals.length > 0 && item.ghosts.length > 0);
  assert(stage, 'simple scoring test requires at least one stage with crystal and ghost');

  const result = {
    cells: [stage.crystals[0], stage.ghosts[0]],
    lines: [],
    crystals: 1,
    ghosts: 1,
    reachedGoal: true,
  };
  const context = TurnResultContext.create(result);
  assert(context.scoreResult.crystals === 1, 'Crystal should stay as automatic beam bonus');
  assert(context.scoreResult.ghosts === 1, 'Ghost should stay as automatic beam penalty');

  const score = calculateScore({
    stage,
    result: context.scoreResult,
    rotations: 1,
    remaining: 5,
    elapsed: 10,
    stageSeconds: 15,
    cleared: true,
    event: ROUND_EVENTS[0],
    maxMoves: 8,
    liveBonus: 2,
  });
  assert(!('crystalLock' in score.breakdown), 'Extra crystal click bonus should not exist');
  assert(!('ghostShield' in score.breakdown), 'Extra ghost click bonus should not exist');
  assert(score.breakdown.live === 2, 'Moving spotlight bonus should be scored as small integer live bonus');
  assert(Number.isInteger(score.score), 'Small scoring should stay integer');
  assert(score.score < 30, 'Small scoring should not return arcade-sized numbers');
}

function verifyMoveLimitsAndLedger() {
  const stage = { ...STAGES[0], board: BOARD_LAYOUTS.normal };
  const moveLimit = new MoveLimitManager('normal');
  const maxMoves = moveLimit.getMaxMoves(stage);
  assert(maxMoves >= stage.par, 'Move limit should be at least par');
  assert(moveLimit.getMovesLeft(2, maxMoves) === maxMoves - 2, 'Move limit should subtract rotations');

  const players = [createEmptyPlayer(0), createEmptyPlayer(1)];
  const ledger = new ScoreLedger(players);
  const scoring = {
    score: 5,
    isPerfect: false,
    mission: true,
    fever: false,
    breakdown: { event: 1 },
    movesLeft: 3,
  };
  const resultContext = TurnResultContext.create({ crystals: 1, ghosts: 0, cells: [], lines: [] });
  ledger.applyTurn({
    playerIndex: 0,
    stage,
    roundIndex: 0,
    resultContext,
    scoring,
    cleared: true,
    rotations: 2,
    maxMoves,
    remaining: 8,
    event: ROUND_EVENTS[0],
  });

  assert(players[0].totalScore === 5, 'Ledger should carry the turn score into result totals');
  assert(players[0].stages.length === 1, 'Ledger should keep per-round score history');
}

function verifyLiveTwist() {
  const manager = new LiveTwistManager();
  const stage = { ...STAGES[0], board: BOARD_LAYOUTS.normal };
  manager.startTurn({ stage, roundIndex: 0, playerIndex: 0, event: ROUND_EVENTS[0] });
  const cell = manager.getActiveSpotlight(0);
  assert(cell && Number.isInteger(cell.x) && Number.isInteger(cell.y), 'Live spotlight should return a board cell');
  const hitResult = { cells: [cell], reachedGoal: true };
  assert(manager.isSpotlightHit(hitResult, 0), 'Live spotlight should detect beam overlap');
  assert(manager.getLiveBonus({ result: hitResult, now: 0, cleared: true }) >= 2, 'Live spotlight clear bonus should be at least +2');
  assert(manager.getLiveBonus({ result: hitResult, now: 0, cleared: false }) === 0, 'Live spotlight should not score when turn is not cleared');
  const danger = manager.getActiveDanger(0);
  assert(danger && Number.isInteger(danger.x) && Number.isInteger(danger.y), 'Live danger should return a board cell');
  const dangerResult = { cells: [danger], reachedGoal: true };
  assert(manager.isDangerHit(dangerResult, 0), 'Live danger should detect beam overlap');
  assert(manager.getLiveBonus({ result: dangerResult, now: 0, cleared: true }) <= -1, 'Live danger should apply a negative score');
}


function verifyMovingBoard() {
  const stage = { ...STAGES[0], board: BOARD_LAYOUTS.normal };
  const manager = new MovingBoardDirector();
  const mirrorStates = cloneMirrors(stage);
  manager.startTurn({ stage, mirrorStates, roundIndex: 0, playerIndex: 0, event: ROUND_EVENTS[0] });
  const goal = manager.getActiveGoal(0);
  const chaser = manager.getActiveChaser(0);
  assert(goal && Number.isInteger(goal.x) && Number.isInteger(goal.y), 'Bonus gate should return a valid cell');
  assert(chaser && Number.isInteger(chaser.x) && Number.isInteger(chaser.y), 'Chaser ghost should return a valid cell');
  const traced = traceBeam(manager.createTraceStage(stage, 0), mirrorStates, BOARD_LAYOUTS.normal);
  assert(manager.createTraceStage(stage, 0) === stage, 'MovingBoardDirector should not move the real goal');
  const patched = manager.applyDynamicResult({ stage, result: traced, now: 0 });
  assert('movingGoal' in patched, 'Dynamic result should include movingGoal flag');
  assert('chaserHit' in patched, 'Dynamic result should include chaserHit flag');
  assert(patched.beamEaten === false, 'Chaser ghost should not block clear');
  assert(patched.reachedGoal === traced.reachedGoal, 'Chaser ghost should not change clear success');
  const dynamicScore = manager.getDynamicScore({ result: patched, cleared: patched.reachedGoal });
  assert(Number.isInteger(dynamicScore.value), 'Moving board score should stay small integer');
}


function keyOfCell(cell) {
  return `${cell.x},${cell.y}`;
}

function assertNoDuplicateCells(cells, label) {
  assert(new Set(cells.map(keyOfCell)).size === cells.length, `${label}: cells should not overlap`);
}

function verifyEnhancedStageBalance(stage, difficulty, boardConfig) {
  const enhanced = enhanceStageForDifficulty(stage, difficulty.id, boardConfig);
  const initial = traceBeam(enhanced, enhanced.mirrors, boardConfig);
  const solutionMirrors = enhanced.mirrors.map((mirror) => ({ ...mirror, type: mirror.solutionType ?? mirror.type }));
  const solved = traceBeam(enhanced, solutionMirrors, boardConfig);

  assert(!initial.reachedGoal, `${enhanced.id}: enhanced stage should not clear immediately`);
  assert(solved.reachedGoal, `${enhanced.id}: enhanced color puzzle should be solvable`);
  assert(solved.matchedEmitters === solved.requiredEmitters, `${enhanced.id}: every colored light should reach its own matching goal`);
  assertNoDuplicateCells(enhanced.emitters, `${enhanced.id}: emitters`);
  assertNoDuplicateCells(enhanced.goals, `${enhanced.id}: goals`);

  enhanced.emitters.forEach((emitter) => {
    assert(emitter.x >= 0 && emitter.y >= 0 && emitter.x < boardConfig.cols && emitter.y < boardConfig.rows, `${enhanced.id}: emitter should stay inside board`);
  });
  enhanced.goals.forEach((goal) => {
    assert(goal.x >= 0 && goal.y >= 0 && goal.x < boardConfig.cols && goal.y < boardConfig.rows, `${enhanced.id}: goal should stay inside board`);
  });

  if (difficulty.id === 'easy') assert(enhanced.emitters.length === 1, 'EASY should keep one light');
  if (difficulty.id === 'normal') assert(enhanced.emitters.length === 2, 'NORMAL should use exactly two lights');
  if (difficulty.id === 'hard') assert(enhanced.emitters.length === 3, 'HARD should use exactly three lights');
  if (difficulty.id !== 'easy') {
    enhanced.emitters.slice(1).forEach((emitter) => {
      assert(emitter.x === 0 && emitter.dir === 'right', `${enhanced.id}: added colored lights should start from the left edge`);
    });
  }
}

function verifyColorPuzzleEnhancement() {
  Object.values(DIFFICULTY_SETTINGS).forEach((difficulty) => {
    const boardConfig = BOARD_LAYOUTS[difficulty.id];
    STAGES.forEach((baseStage) => {
      for (let round = 0; round < difficulty.roundCount; round += 1) {
        for (let player = 0; player < 4; player += 1) {
          const stage = remixStageForPlayer(baseStage, round, player, boardConfig);
          verifyEnhancedStageBalance(stage, difficulty, boardConfig);
        }
      }
    });
  });

  const hardBoard = BOARD_LAYOUTS.hard;
  const hardStage = remixStageForPlayer(STAGES[2], 0, 0, hardBoard);
  const enhancedHard = enhanceStageForDifficulty(hardStage, 'hard', hardBoard);
  assert('splitters' in enhancedHard, 'Enhanced hard stage should include splitter metadata');
}

function verifyTurnManager() {
  Object.values(DIFFICULTY_SETTINGS).forEach((difficulty) => {
    const stagePool = STAGES.filter((stage) => difficulty.stageIds.includes(stage.id));
    const manager = new TurnManager({
      stages: STAGES,
      stagePool,
      roundEvents: ROUND_EVENTS,
      roundCount: difficulty.roundCount,
      playerCount: 4,
      boardConfig: BOARD_LAYOUTS[difficulty.id],
    });

    assert(manager.roundOrders.length === difficulty.roundCount, `${difficulty.id}: round order count`);
    manager.roundOrders.forEach((order, index) => {
      assert(order.length === 4, `${difficulty.id}: round ${index + 1} should include 4 players`);
      assert(new Set(order).size === 4, `${difficulty.id}: round ${index + 1} should not duplicate players`);
    });
  });
}

function verifyUiRefreshSource() {
  const sceneSource = readFileSync(new URL('../src/game/scenes/MirrorPartyScene.js', import.meta.url), 'utf8');
  const boardRendererSource = readFileSync(new URL('../src/game/systems/BoardRenderer.js', import.meta.url), 'utf8');
  const hudRendererSource = readFileSync(new URL('../src/game/systems/HudRenderer.js', import.meta.url), 'utf8');
  const flowRendererSource = readFileSync(new URL('../src/game/systems/FlowScreenRenderer.js', import.meta.url), 'utf8');
  const resultRendererSource = readFileSync(new URL('../src/game/systems/ResultScreenRenderer.js', import.meta.url), 'utf8');
  const effectsSource = readFileSync(new URL('../src/game/systems/SceneEffects.js', import.meta.url), 'utf8');
  const liveTwistSource = readFileSync(new URL('../src/game/systems/LiveTwistManager.js', import.meta.url), 'utf8');
  const movingBoardSource = readFileSync(new URL('../src/game/systems/MovingBoardDirector.js', import.meta.url), 'utf8');
  const funnyMomentSource = readFileSync(new URL('../src/game/systems/FunnyMomentDirector.js', import.meta.url), 'utf8');
  const colorPuzzleSource = readFileSync(new URL('../src/game/systems/ColorPuzzleDirector.js', import.meta.url), 'utf8');
  const helperSource = readFileSync(new URL('../src/game/systems/sceneUiHelpers.js', import.meta.url), 'utf8');
  const splitSource = [boardRendererSource, hudRendererSource, flowRendererSource, resultRendererSource, effectsSource, helperSource, liveTwistSource, movingBoardSource, funnyMomentSource, colorPuzzleSource].join('\n');
  const gameUiSource = `${sceneSource}\n${splitSource}`;
  const appSource = readFileSync(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
  const startScreenSource = readFileSync(new URL('../src/app/screens/StartScreen/StartScreen.tsx', import.meta.url), 'utf8');
  const gameScreenSource = readFileSync(new URL('../src/app/screens/GameScreen/GameScreen.tsx', import.meta.url), 'utf8');
  const resultScreenSource = readFileSync(new URL('../src/app/screens/ResultScreen/ResultScreen.tsx', import.meta.url), 'utf8');
  const gameManagerSource = readFileSync(new URL('../src/game/GameManager.ts', import.meta.url), 'utf8');
  const cssSource = readFileSync(new URL('../src/main.css', import.meta.url), 'utf8');
  const gameConfigSource = readFileSync(new URL('../src/game/data/gameConfig.js', import.meta.url), 'utf8');
  assert(gameConfigSource.includes('BOARD_LAYOUTS'), 'Difficulty-specific board layouts should exist');
  assert(gameConfigSource.includes("easy: { x:") && gameConfigSource.includes("hard: { x:"), 'Easy/Hard board layouts should be configured');
  const manifest = JSON.parse(readFileSync(new URL('../resources/asset-manifest.json', import.meta.url), 'utf8'));
  const viteConfig = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8');
  const resourcePathsSource = readFileSync(new URL('../src/game/data/resourcePaths.js', import.meta.url), 'utf8');

  assert(sceneSource.includes('turnClosing'), 'Scene should lock input while turn result is pending');
  assert(gameUiSource.includes('HOW_TO_PAGES'), 'Phaser help should use the same HOW_TO_PAGES data as React');
  assert(sceneSource.includes("if (this.mode !== 'playing') return;"), 'H key should not hidden-toggle outside playing mode');
  assert(hudRendererSource.includes('drawScorePops()'), 'Scene should define drawScorePops used by drawPlaying');
  assert(gameUiSource.includes('this.tweens.add'), 'Scene should use tween animation for game-like motion');
  assert(effectsSource.includes('addConfettiRain()') && resultRendererSource.includes('addConfettiRain()'), 'Result should use animated confetti');
  assert(effectsSource.includes('addClearBurst()') && flowRendererSource.includes('addClearBurst()'), 'Clear handoff should use a burst effect');
  assert(gameUiSource.includes('playCountdown()'), 'Countdown SE should be used');
  assert(gameUiSource.includes('playFever()'), 'Fever SE should be used');
  assert(gameUiSource.includes('playRanking()'), 'Ranking SE should be used');
  assert(sceneSource.includes('GimmickDirector'), 'Scene should use GimmickDirector for live gimmick feedback');
  assert(sceneSource.includes('LiveTwistManager'), 'Scene should use LiveTwistManager for dynamic bonus targets');
  assert(sceneSource.includes('MovingBoardDirector'), 'Scene should use MovingBoardDirector for fair bonus gate and ghost avoid');
  assert(sceneSource.includes('FunnyMomentDirector'), 'Scene should use FunnyMomentDirector for party reactions');
  assert(boardRendererSource.includes('drawSpotlightTarget'), 'Board should draw the moving spotlight bonus target');
  assert(boardRendererSource.includes('drawDangerTarget'), 'Board should draw the moving danger target');
  assert(boardRendererSource.includes('drawMovingGoal'), 'Board should draw the bonus gate near the fixed goal');
  assert(boardRendererSource.includes('drawChaserGhost'), 'Board should draw the chaser ghost');
  assert(hudRendererSource.includes('twistBadges'), 'HUD should show live bonus and danger badges');
  assert(hudRendererSource.includes('drawGimmickBadges()'), 'Scene should draw live gimmick badges');
  assert(boardRendererSource.includes('drawRouteMarker'), 'Board should draw a moving beam marker');
  assert(boardRendererSource.includes('↻'), 'Mirrors should show a rotate marker');
  assert(hudRendererSource.includes('drawHelpMotionDemo'), 'In-game help should include motion demo drawing');
  assert(sceneSource.includes('this.time.now / 100'), 'Playing screen should refresh fast enough for beam motion');
  assert(sceneSource.includes('getMoveBonus()'), 'Round events should affect move budget');
  assert(gameUiSource.includes("'round-ticket'"), 'Round event icon should be preloaded');
  assert(gameUiSource.includes("'timer-bell'"), 'Move limit icon should be preloaded');

  assert(appSource.includes("type Screen = 'start' | 'game' | 'result'"), 'App.tsx should own start/game/result flow');
  assert(appSource.includes('StartScreen') && appSource.includes('GameScreen') && appSource.includes('ResultScreen'), 'App.tsx should switch between screen components');
  assert(startScreenSource.includes('title-shell'), 'StartScreen should use the title UI shell');
  assert(startScreenSource.includes('title-card'), 'StartScreen should use the title card');
  assert(!startScreenSource.includes('title-v13-shell'), 'Old v13 title shell should not remain in StartScreen.tsx');
  assert(!startScreenSource.includes('title-v14-shell'), 'Old v14 title shell should not remain in StartScreen.tsx');
  assert(!startScreenSource.includes('title-v15-shell'), 'Old v15 title shell should not remain in StartScreen.tsx');
  assert(!startScreenSource.includes('title-v17-shell'), 'Old v17 title shell should not remain in StartScreen.tsx');
  assert(!startScreenSource.includes('title-v23-shell'), 'Old v23 title shell should not remain in StartScreen.tsx');
  assert(!startScreenSource.includes('arcade-shell'), 'Old stacked arcade-shell class should not remain in StartScreen.tsx');
  assert(startScreenSource.includes('compactModeLabel'), 'Mode labels should be shortened to avoid wrapping');
  assert(startScreenSource.includes("if (id === 'normal') return 'NORM'"), 'NORMAL should be shortened to NORM');
  assert(startScreenSource.includes('TitleAttractPreview'), 'Title screen should include an animated attract preview component');
  assert(startScreenSource.includes('attract-mini-board'), 'Title attract preview should show a miniature animated board');
  assert(startScreenSource.includes('boardLabel'), 'Title screen should show the active board size');
  assert(startScreenSource.includes('HowToDemo'), 'How-to modal should include motion-style demo pages');
  assert(startScreenSource.includes('盤面'), 'Title should show board-size context compactly');
  assert(gameScreenSource.includes('startGame') && gameScreenSource.includes('onFinish'), 'GameScreen should start Phaser and receive GameResult');
  assert(resultScreenSource.includes('GameResult') && resultScreenSource.includes('TITLE'), 'ResultScreen should render external GameResult');
  assert(gameManagerSource.includes('export function startGame') && gameManagerSource.includes('onFinish'), 'GameManager.ts should expose startGame with result callback');
  assert(cssSource.includes('@keyframes routeFlash'), 'Title attract preview should include moving route animation');
  assert(cssSource.includes('@keyframes demoDot'), 'How-to demo should animate the light path');
  assert(startScreenSource.includes('aria-pressed={settings.difficulty === item.id}'), 'Mode buttons should expose selected state');
  assert(startScreenSource.includes('aria-pressed={settings.totalSeconds === seconds}'), 'Time buttons should expose selected state');
  assert(!startScreenSource.includes('status-ribbon'), 'duplicate title status ribbon should be removed from StartScreen.tsx');

  assert(cssSource.includes('.title-shell'), 'title shell CSS should exist');
  assert(cssSource.includes('width: min(1420px'), 'Title card should stay large enough for the menu');
  assert(cssSource.includes('grid-template-columns: 150px minmax(520px, 1fr) 310px'), 'Title menu should reserve enough width for three modes and time buttons');
  assert(cssSource.includes("content: '✓'"), 'Active menu buttons should show a check mark');
  assert(cssSource.includes('.time-button b'), 'Time buttons should use non-ellipsis number labels');
  assert(cssSource.includes('height: 100dvh'), 'title shell should fit viewport height');
  assert(cssSource.includes('overflow: hidden'), 'title screen should not rely on visible scrollbars');
  assert(!cssSource.includes('.title-v15-shell'), 'Old v15 CSS selector should not remain in main.css');
  assert(!cssSource.includes('.title-v18-shell'), 'Old v18 CSS selector should not remain in main.css');
  assert(!cssSource.includes('.title-v23-shell'), 'Old v23 CSS selector should not remain in main.css');
  assert(!cssSource.includes('.title-v17-shell'), 'Old v17 CSS selector should not remain in main.css');
  assert(!cssSource.includes('.title-v14-shell'), 'Old v14 CSS selector should not remain in main.css');
  assert(!cssSource.includes('.title-v13-shell'), 'Old v13 CSS selector should not remain in main.css');


  assert(!gameConfigSource.includes('showtime:'), 'Difficulty settings should be limited to easy / normal / hard');
  assert(gameConfigSource.includes('roundCount: 3'), 'Difficulties should use fixed 3 rounds');
  assert(gameConfigSource.includes('cell: 72'), 'Board cells should be larger than the previous compact layout');
  assert(hudRendererSource.includes('Stage names are hidden'), 'HUD should intentionally hide stage names during play');
  assert(flowRendererSource.includes('Keep the previous board on screen'), 'Player handoff should be a popup over the game board');
  assert(flowRendererSource.includes('AUTO NEXT'), 'Player handoff should auto-count down instead of waiting on a button');
  assert(flowRendererSource.includes('this.handoffAutoCall'), 'Handoff should store the auto transition timer');
  assert(!flowRendererSource.includes('targets: [panel, playerText, start], y:'), 'Turn intro should not tween player label to absolute top edge');
  assert(flowRendererSource.includes('previous absolute y tween moved the player label'), 'Turn intro should document the safe-area player label fix');
  assert(cssSource.includes('Safe-area fixes: turn intro player labels'), 'CSS should include HOW TO score page safe-area fixes');

  assert(sceneSource.split('\n').length <= 440, 'MirrorPartyScene should stay compact after renderer split');
  assert(boardRendererSource.includes('export default class BoardRenderer'), 'BoardRenderer class should exist');
  assert(hudRendererSource.includes('export default class HudRenderer'), 'HudRenderer class should exist');
  assert(flowRendererSource.includes('export default class FlowScreenRenderer'), 'FlowScreenRenderer class should exist');
  assert(resultRendererSource.includes('export default class ResultScreenRenderer'), 'ResultScreenRenderer class should exist');
  assert(effectsSource.includes('export default class SceneEffects'), 'SceneEffects class should exist');
  assert(liveTwistSource.includes('export default class LiveTwistManager'), 'LiveTwistManager class should exist');
  assert(movingBoardSource.includes('export default class MovingBoardDirector'), 'MovingBoardDirector class should exist');
  assert(funnyMomentSource.includes('export default class FunnyMomentDirector'), 'FunnyMomentDirector class should exist');
  assert(colorPuzzleSource.includes('enhanceStageForDifficulty'), 'ColorPuzzleDirector should enhance stages by difficulty');
  assert(colorPuzzleSource.includes('markFixedMirrors'), 'ColorPuzzleDirector should add fair fixed mirrors by difficulty');
  assert(colorPuzzleSource.includes('fixedMirrors'), 'ColorPuzzleDirector should expose fixed mirror count in puzzleRule');
  assert(sceneSource.includes('enhanceStageForDifficulty'), 'Scene should apply color puzzle enhancement before play');
  assert(sceneSource.includes('mirror.locked'), 'Scene should block clicks on fixed mirrors');
  assert(boardRendererSource.includes('LIGHT_COLOR_HEX'), 'BoardRenderer should draw colored lights and goals');
  assert(effectsSource.includes('addRouteReplay'), 'Clear handoff should support route replay effect');
  assert(hudRendererSource.includes('drawReactionBanner'), 'HUD should draw short party reactions');
  assert(movingBoardSource.includes('The real exit does not move'), 'MovingBoardDirector should document the fair fixed-exit rule');
  assert(sceneSource.includes('this.boardRenderer = new BoardRenderer(this)'), 'Scene should compose BoardRenderer');
  assert(sceneSource.includes('this.hudRenderer = new HudRenderer(this)'), 'Scene should compose HudRenderer');
  assert(sceneSource.includes('this.flowScreens = new FlowScreenRenderer(this)'), 'Scene should compose FlowScreenRenderer');
  assert(sceneSource.includes('this.resultScreen = new ResultScreenRenderer(this)'), 'Scene should compose ResultScreenRenderer');
  assert(sceneSource.includes('this.effects = new SceneEffects(this)'), 'Scene should compose SceneEffects');

  assert(manifest.version === '1.0.0', 'resource manifest should match 1.0.0');
  assert(manifest.icons.includes('icons/title-logo.png'), 'resource manifest should include the PNG title logo');
  assert(manifest.icons.every((item) => item.endsWith('.png')), 'resource manifest should use PNG icons only');
  assert(!manifest.icons.some((item) => item.endsWith('.svg')), 'resource manifest should not reference SVG icons');

  assert(!gameUiSource.includes("'ORDER'"), 'Playing HUD should not show ORDER panel');
  assert(!gameUiSource.includes("'RANK'"), 'Playing HUD should not show RANK panel');
  assert(!gameUiSource.includes('drawDirectorPanel'), 'Director side panel should be removed');
  assert(!gameUiSource.includes('`M ${'), 'HUD should not show cryptic M abbreviation');
  assert(!gameUiSource.includes('  霊'), 'Handoff should not show old ghost abbreviation row');
  assert(gameUiSource.includes('compactMission'), 'Mission text should be compacted before display');
  assert(gameUiSource.includes("'BONUS'"), 'Result should use compact BONUS panel');
  assert(!gameUiSource.includes("'AWARDS'"), 'Result should not show old AWARDS label');
  assert(!gameUiSource.includes("['AVG'"), 'Result should not show old summary strip');
  assert(!gameUiSource.includes('`C${player.clears}'), 'Result should not show compressed C/M/R debug-like text');
  assert(!gameUiSource.includes('`R ${player.stages'), 'Result should not show round score slash debug line');
  assert(resourcePathsSource.includes('import.meta.glob'), 'Resources should be bundled from resources/ without public/');
  assert(!gameUiSource.includes("'/resources/audio"), 'Scene should not hardcode public audio paths');
  assert(!startScreenSource.includes('import.meta.env.BASE_URL}resources'), 'React UI should not hardcode public resources path');
  assert(viteConfig.includes('hmr: false'), 'Vite dev server should disable HMR websocket by default');
  assert(viteConfig.includes('strictPort: true'), 'Vite dev server should use strictPort for predictable local URLs');
  assert(readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8').includes('./app/App'), 'main.tsx should mount src/app/App.tsx');
  assert(gameManagerSource.includes('MirrorPartyScene'), 'GameManager.ts should own Phaser scene creation');
  assert(resultScreenSource.includes('result-title-button'), 'ResultScreen should use a centered TITLE button');
}



verifyStages();
verifySimpleScoring();
verifyMoveLimitsAndLedger();
verifyLiveTwist();
verifyMovingBoard();
verifyColorPuzzleEnhancement();
verifyTurnManager();
verifyUiRefreshSource();
console.log(JSON.stringify({
  status: 'ok',
  baseStages: STAGES.length,
  remixChecks: STAGES.length * Object.keys(DIFFICULTY_SETTINGS).length * 3 * 4,
  difficulties: Object.keys(DIFFICULTY_SETTINGS).length,
  roundEvents: ROUND_EVENTS.length,
  scoreScale: 'small-integer',
  control: 'mirror-click-rotate-only',
  uiRefresh: 'complete-light-placement-balance',
  assetFormat: 'png',
  devHmr: 'disabled',
  boardLayouts: Object.fromEntries(Object.entries(BOARD_LAYOUTS).map(([id, board]) => [id, `${board.cols}x${board.rows}`])),
  puzzleEnhancement: 'color-lights-goals-splitter-replay-fixed-mirror-auto-handoff',
}, null, 2));
