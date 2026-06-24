/**
 * クリック後に出す短いリアクションとスコアポップをまとめるDirectorです。
 * Scene本体から演出判定を分離し、入力処理を読みやすく保ちます。
 */
export default class TurnFeedbackDirector {
  applyClickFeedback({ scene, pointer }) {
    const liveState = scene.liveTwistManager?.getLiveScore({
      result: scene.currentResult,
      now: scene.time.now,
      cleared: scene.currentResult.reachedGoal,
    });
    const boardState = scene.movingBoardDirector?.getDynamicScore({
      result: scene.currentResult,
      cleared: scene.currentResult.reachedGoal,
    });

    this.pushBonusPops({ scene, pointer, liveState, boardState });
    if (scene.currentDramaState?.state && scene.currentDramaState.state !== 'search') {
      scene.scorePops.push({ x: pointer.x, y: pointer.y - 156, text: scene.currentDramaState.label, born: scene.time.now });
      if (scene.currentDramaState.tone === 'danger') scene.audio.playGhost();
      if (scene.currentDramaState.bonus > 0) scene.audio.playPerfect();
    }
    if (scene.currentRoundRuleState?.success) {
      scene.scorePops.push({ x: pointer.x, y: pointer.y - 182, text: scene.currentRoundRule?.shortLabel ?? '狙い +1', born: scene.time.now });
      scene.audio.playPerfect();
    }

    return scene.funnyMomentDirector.createReaction({
      result: scene.currentResult,
      rotations: scene.turnRotations,
      maxMoves: scene.maxMoves,
      liveState,
      boardState,
      dramaState: scene.currentDramaState,
    });
  }

  pushBonusPops({ scene, pointer, liveState, boardState }) {
    const items = [
      [liveState?.spot, 'スポット', -26, 'hint'],
      [liveState?.danger, '危険', -52, 'ghost'],
      [liveState?.combo, 'コンボ', -78, 'event'],
      [boardState?.movingGoal, 'ボーナス門', -104, 'event'],
      [boardState?.ghostAvoided, 'おばけ回避', -130, 'hint'],
      [boardState?.chaserHit, 'おばけ通過', -130, 'ghost'],
    ];

    items.forEach(([active, text, offset, sound]) => {
      if (!active) return;
      scene.scorePops.push({ x: pointer.x, y: pointer.y + offset, text, born: scene.time.now });
      if (sound === 'hint') scene.audio.playHint();
      if (sound === 'ghost') scene.audio.playGhost();
      if (sound === 'event') scene.audio.playEvent();
    });
  }
}
