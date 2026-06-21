/**
 * Phaserから返されたGameResultを表示するReact側の結果画面です。
 * 外部のメインゲームへ渡す順位・得点・プレイヤー結果を確認しやすい形に整えます。
 */
import Icon from '../../components/Icon'
import type { GameResult } from '../../types/game'
import './ResultScreen.css'

type Props = {
  result: GameResult
  onBack: () => void
}

/**
 * React result screen used by the host app.
 * This is the integration point for Mario-Party-like game flow: Phaser returns GameResult, App displays it here.
 */
// React側へ返された結果を外部連携確認用にも見やすく表示します。
export default function ResultScreen({ result, onBack }: Props) {
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

// 指定した項目で一番高いプレイヤーをBONUS表示用に返します。
function topValue(items: GameResult['results'], key: 'crystals') {
  return Math.max(...items.map((item) => item[key]), 0)
}

// 少ない方が良い項目のBONUS表示用にプレイヤーを返します。
function lowestValue(items: GameResult['results'], key: 'ghosts' | 'rotations') {
  if (items.length === 0) return 0
  return Math.min(...items.map((item) => item[key]))
}
