import { pickRandom, shuffle } from './random.js';
import { createRoundStageAssignments } from './stageRemix.js';

/**
 * TurnManager owns the round order, per-player stage assignment, and current
 * cursor. The Phaser Scene asks this class who should play next instead of
 * directly editing roundIndex/orderIndex everywhere.
 */
export default class TurnManager {
  constructor({ stages, stagePool, roundEvents, roundCount, playerCount, boardConfig }) {
    this.playerCount = playerCount;
    this.roundCount = roundCount;
    const safeStagePool = stagePool.length >= playerCount ? shuffle(stagePool) : shuffle(stages);

    this.roundStageAssignments = createRoundStageAssignments({
      stagePool: safeStagePool,
      roundCount,
      playerCount,
      fallbackStages: stages,
      boardConfig,
    });
    this.roundOrders = Array.from({ length: roundCount }, () => shuffle([...Array(playerCount).keys()]));
    this.roundEvents = pickRandom(roundEvents, roundCount);
    this.roundIndex = 0;
    this.orderIndex = 0;
  }

  /** Current player/stage/event as one immutable-looking object. */
  getCurrentTurn() {
    const playerIndex = this.roundOrders[this.roundIndex][this.orderIndex];
    return {
      playerIndex,
      stage: this.roundStageAssignments[this.roundIndex][playerIndex],
      event: this.roundEvents[this.roundIndex],
      roundIndex: this.roundIndex,
      orderIndex: this.orderIndex,
      roundCount: this.roundCount,
    };
  }

  /** Move to the next player. Returns false after the final turn. */
  advance() {
    this.orderIndex += 1;
    if (this.orderIndex >= this.playerCount) {
      this.orderIndex = 0;
      this.roundIndex += 1;
    }
    return this.roundIndex < this.roundCount;
  }

  /** Label used on handoff screens. */
  getNextLabel(playerNames) {
    const nextOrder = this.orderIndex + 1;
    if (nextOrder < this.playerCount) {
      const nextPlayer = this.roundOrders[this.roundIndex][nextOrder];
      return `NEXT: ${playerNames[nextPlayer]} / ROUND ${this.roundIndex + 1}`;
    }
    if (this.roundIndex + 1 < this.roundCount) {
      const nextPlayer = this.roundOrders[this.roundIndex + 1][0];
      return `NEXT ROUND ${this.roundIndex + 2}: ${playerNames[nextPlayer]} から開始`;
    }
    return 'NEXT: FINAL RESULT';
  }
}
