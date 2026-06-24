/**
 * Phaserから返されたGameResultを表示するReact側の結果画面です。
 * 外部のメインゲームへ渡す順位・得点・勝因を、ゲーム終了後に確認しやすい形へ整えます。
 */
import { useEffect } from 'react'
import Icon from '../../components/Icon'
import type { GameResult, PlayerResult } from '../../types/game'
import { audioUrl } from '../../../game/data/resourcePaths.js'
import './ResultScreen.css'

type Props = {
  result: GameResult
  onBack: () => void
}

// Result画面でもBGM/SEを鳴らします。Phaserを破棄した後のReact画面なので、HTMLAudioで再生します。
function useResultAudio() {
  useEffect(() => {
    const bgm = new Audio(audioUrl('bgm-result'))
    const award = new Audio(audioUrl('award'))
    const ranking = new Audio(audioUrl('ranking'))
    bgm.loop = true
    bgm.volume = 0.12
    award.volume = 0.28
    ranking.volume = 0.24

    bgm.play().catch(() => {})
    ranking.play().catch(() => {})
    window.setTimeout(() => award.play().catch(() => {}), 320)

    return () => {
      bgm.pause()
      award.pause()
      ranking.pause()
    }
  }, [])
}

function roundLabel(stage: PlayerResult['stages'][number]) {
  const mark = stage.cleared ? 'CLEAR' : 'MISS'
  return `R${stage.round + 1} ${stage.score}点 ${mark}`
}

function bestPlayerReason(player: PlayerResult) {
  if (player.bestRound) return `${player.winReason ?? '勝因'} / R${player.bestRound.round} ${player.bestRound.score}点`
  return player.winReason ?? '勝因なし'
}

export default function ResultScreen({ result, onBack }: Props) {
  useResultAudio()
  const ranking = result.results
  const champion = ranking[0]

  return (
    <main className="app result-shell">
      <section className="result-card" aria-label="リザルト画面">
        <div className="result-spotlight" aria-hidden="true" />
        <header className="result-header">
          <p>RESULT</p>
          <h1>{champion ? `WINNER P${champion.player}` : 'RESULT'}</h1>
          <span>{result.roundCount} ROUND</span>
          {champion && <strong className="result-win-reason">勝因 {bestPlayerReason(champion)}</strong>}
        </header>

        <div className="result-ranking" aria-label="順位">
          {ranking.map((player) => (
            <article className={player.rank === 1 ? 'result-row top' : 'result-row'} key={player.player}>
              <strong className="result-rank">{player.rank}</strong>
              <div className="result-player">
                <Icon name="player-badge" label="プレイヤー" />
                <span>P{player.player}</span>
              </div>
              <div className="result-score"><b>{player.score}</b><span>点</span></div>
              <div className="result-clear">CLEAR {player.clears}/{result.roundCount}</div>
              <div className="result-reason">{player.winReason ?? '勝因なし'}</div>
              <div className="result-round-pips" aria-label={`P${player.player}のラウンド別点数`}>
                {player.stages.slice(0, result.roundCount).map((stage) => (
                  <span className={stage.cleared ? 'clear' : 'miss'} key={`${player.player}-${stage.round}`}>{roundLabel(stage)}</span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="result-bonus" aria-label="ボーナス">
          <span><Icon name="crystal" label="水晶" />水晶 {topValue(ranking, 'crystals')}</span>
          <span><Icon name="ghost" label="おばけ" />回避 {lowestValue(ranking, 'ghosts')}</span>
          <span><Icon name="mirror-slash" label="鏡" />省MOVE {lowestValue(ranking, 'rotations')}</span>
        </div>

        <button className="result-title-button" onClick={onBack}>TITLE</button>
      </section>
    </main>
  )
}

// 指定した項目で一番高い値をBONUS表示用に返します。
function topValue(items: GameResult['results'], key: 'crystals') {
  return Math.max(...items.map((item) => item[key]), 0)
}

// 少ない方が良い項目の値をBONUS表示用に返します。
function lowestValue(items: GameResult['results'], key: 'ghosts' | 'rotations') {
  if (items.length === 0) return 0
  return Math.min(...items.map((item) => item[key]))
}
