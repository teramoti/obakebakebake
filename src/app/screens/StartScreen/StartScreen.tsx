/**
 * タイトル、人数、難易度、時間、遊び方を表示する開始画面です。
 * GameManagerの設定を購読し、React側の設定変更をゲーム開始時のGameSettingsへ反映します。
 */
import { useState, useSyncExternalStore, type CSSProperties } from 'react'
import Icon from '../../components/Icon'
import { DIFFICULTY_SETTINGS, TIME_OPTIONS } from '../../../game/data/gameConfig.js'
import { HOW_TO_PAGES, SCORE_GUIDE } from '../../../game/data/howToGuide.js'
import { getGameSettings, setGameSettings, subscribeGameSettings } from '../../../game/GameManager'
import { iconUrl } from '../../../game/data/resourcePaths.js'
import type { DifficultyId, GameSettings } from '../../types/game'
import './StartScreen.css'

type DifficultyItem = {
  id: DifficultyId
  label: string
  roundCount: number
  boardLabel: string
}

type Props = {
  onStart: (settings: GameSettings) => void
}

const difficultyList = Object.values(DIFFICULTY_SETTINGS) as DifficultyItem[]

// 表示幅を守るため、長い難易度名だけ短縮します。
const compactModeLabel = (id: string, label: string) => {
  if (id === 'normal') return 'NORM'
  return label
}

const demoRouteCells = [
  ['flashlight', 'beam-spark', 'mirror-slash', 'beam-spark', 'target-door'],
  ['', '', 'beam-spark', '', ''],
  ['crystal', '', 'mirror-backslash', 'beam-spark', 'perfect-star'],
]

const scoreDemoItems = [
  ['target-door', 'CLEAR', '+2'],
  ['flashlight', '色', '+1'],
  ['beam-spark', '分岐', '+1'],
  ['ghost', '回避', '+1'],
]

// 動画風ヘルプ内の小さな盤面セルを描画します。
function DemoCell({ type, highlight = false }: { type: string; highlight?: boolean }) {
  return (
    <div className={highlight ? 'demo-cell highlight' : 'demo-cell'}>
      {type && <Icon name={type} label={type} className="demo-icon" />}
    </div>
  )
}

// タイトル画面でゲーム内容が伝わるよう、ミニ盤面デモを表示します。
function TitleAttractPreview({ settings }: { settings: GameSettings }) {
  const difficulty = DIFFICULTY_SETTINGS[settings.difficulty] ?? DIFFICULTY_SETTINGS.normal

  return (
    <div className="title-attract" aria-label="ゲームの流れ">
      <div className="attract-chip">
        <Icon name="player-badge" label="プレイヤー" />
        <div><b>{settings.playerCount}人</b><span>3R交代</span></div>
      </div>

      <div className="attract-route attract-mini-board" aria-label="タイトルの盤面デモ">
        <span className="attract-cell"><Icon name="flashlight" label="黄ライト" /></span>
        <span className="attract-cell beam-cell" />
        <span className="attract-cell"><Icon name="target-door" label="黄ゴール" /></span>
        <span className="attract-cell"><Icon name="flashlight" label="青ライト" /></span>
        <span className="attract-cell"><Icon name="mirror-slash" label="鏡" /></span>
        <span className="attract-cell"><Icon name="target-door" label="青ゴール" /></span>
        <span className="attract-beam attract-beam-yellow" />
        <span className="attract-beam attract-beam-cyan" />
        <span className="attract-clear">CLEAR!</span>
      </div>

      <div className="attract-chip attract-risk">
        <Icon name="target-door" label="ボーナス門" />
        <Icon name="ghost" label="おばけ回避" />
        <div><b>{difficulty.boardLabel}</b><span>盤面</span></div>
      </div>
    </div>
  )
}

// 遊び方ページごとに、光の流れ・クリック・点数を動きで見せます。
function HowToDemo({ pageNumber }: { pageNumber: number }) {
  if (pageNumber === 3) {
    return (
      <div className="howto-demo score-demo" aria-label="点数の動く説明">
        {scoreDemoItems.map(([icon, label, point], index) => (
          <div className="score-demo-card" style={{ '--delay': `${index * 0.14}s` } as CSSProperties} key={label}>
            <Icon name={icon} label={label} />
            <strong>{label}</strong>
            <span>{point}</span>
          </div>
        ))}
      </div>
    )
  }

  const isClickPage = pageNumber === 2

  return (
    <div className={isClickPage ? 'howto-demo route-demo click-demo' : 'howto-demo route-demo'} aria-label="光の動き説明">
      <div className="route-demo-board">
        {demoRouteCells.flat().map((cell, index) => (
          <DemoCell
            type={cell}
            highlight={isClickPage && (index === 2 || index === 12)}
            key={`${pageNumber}-${cell}-${index}`}
          />
        ))}
        <span className="demo-beam demo-beam-a" />
        <span className="demo-beam demo-beam-b" />
        <span className="demo-beam-dot" />
        {isClickPage && <span className="demo-click-ring" />}
      </div>
      <div className="demo-result-badge">{isClickPage ? 'CLICK → 回転' : 'CLEAR +2'}</div>
    </div>
  )
}

// プレイヤーが遊び方画面内で鏡クリックを試せる練習盤面です。
function PracticeBoard() {
  const [mirror, setMirror] = useState('mirror-slash')
  const isClear = mirror === 'mirror-backslash'

  return (
    <div className="practice-card" aria-label="遊び方の実演ミニボード">
      <div className="practice-board">
        <div className="practice-cell"><Icon name="flashlight" label="ライト" /></div>
        <div className="practice-cell"><Icon name="beam-spark" label="光" /></div>
        <button
          className="practice-cell mirror"
          onClick={() => setMirror(isClear ? 'mirror-slash' : 'mirror-backslash')}
          aria-label="鏡を回す"
        >
          <Icon name={mirror} label="鏡" />
        </button>
        <div className="practice-cell"><Icon name="beam-spark" label="光" /></div>
        <div className="practice-cell"><Icon name="target-door" label="出口" /></div>
      </div>
      <div className="practice-status">
        <strong>{isClear ? 'CLEAR +2' : 'クリックで回転'}</strong>
        <span>鏡だけ操作</span>
      </div>
    </div>
  )
}

// 3ページ式の遊び方モーダルです。説明文より動く見本を優先します。
function HowToModal({ onClose }: { onClose: () => void }) {
  const [pageIndex, setPageIndex] = useState(0)
  const page = HOW_TO_PAGES[pageIndex]
  const isFirst = pageIndex === 0
  const isLast = pageIndex === HOW_TO_PAGES.length - 1

  const goBack = () => setPageIndex((current) => Math.max(0, current - 1))
  const goNext = () => setPageIndex((current) => Math.min(HOW_TO_PAGES.length - 1, current + 1))

  return (
    <div className="howto-overlay" role="dialog" aria-modal="true" aria-label="遊び方説明">
      <section className="howto-window">
        <button className="modal-close" onClick={onClose} aria-label="遊び方を閉じる">×</button>

        <header className="manual-header">
          <div>
            <p>HOW TO</p>
            <h2>{page.title}</h2>
          </div>
          <strong>{page.number}/3</strong>
        </header>

        <nav className="manual-tabs" aria-label="遊び方ページ切り替え">
          {HOW_TO_PAGES.map((item, index) => (
            <button
              className={index === pageIndex ? 'manual-tab active' : 'manual-tab'}
              key={item.number}
              onClick={() => setPageIndex(index)}
              aria-label={`遊び方 ${item.number}ページ目`}
            >
              <b>{item.number}</b>
              <span>{item.badge}</span>
            </button>
          ))}
        </nav>

        <div className="manual-page" key={page.number}>
          <HowToDemo pageNumber={page.number} />

          <div className="manual-copy">
            <p>{page.lead}</p>
            <div className="manual-card-row" aria-label="ページ内の説明カード">
              {page.cards.map(([icon, title, text]: [string, string, string]) => (
                <div className="manual-mini-card" key={`${page.number}-${title}`}>
                  <div className="manual-card-icon"><Icon name={icon} label={title} /></div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {page.number === 2 && <PracticeBoard />}

            {page.number === 3 && (
              <div className="score-guide-strip" aria-label="スコア説明">
                {SCORE_GUIDE.map(([label, point]: [string, string]) => (
                  <div key={label}><strong>{label}</strong><span>{point}</span></div>
                ))}
              </div>
            )}
          </div>
        </div>

        <footer className="manual-footer">
          <button className="manual-nav-button" onClick={goBack} disabled={isFirst}>BACK</button>
          {isLast ? (
            <button className="manual-nav-button finish" onClick={onClose}>OK</button>
          ) : (
            <button className="manual-nav-button next" onClick={goNext}>NEXT</button>
          )}
        </footer>
      </section>
    </div>
  )
}

// GameManagerの設定を読み、開始時にAppへ設定を渡します。
export default function StartScreen({ onStart }: Props) {
  const settings = useSyncExternalStore(subscribeGameSettings, getGameSettings, getGameSettings)
  const [showHowTo, setShowHowTo] = useState(false)

  // 人数・難易度・時間をGameManagerへ集約して保存します。
  const applySettings = (partialSettings: Partial<GameSettings>) => {
    setGameSettings({ ...settings, ...partialSettings })
  }

  return (
    <main className="app title-shell">
      {showHowTo && <HowToModal onClose={() => setShowHowTo(false)} />}
      <section className="title-card" aria-label="タイトル画面">
        {/* タイトルだけで遊びの内容が伝わるよう、ロゴと短いゲーム要素を同じ場所に置きます。 */}
        <header className="title-hero" aria-label="ゲーム紹介">
          <img className="title-logo-image" src={iconUrlForTitle()} alt="ピカッと！おばけミラー" draggable="false" />
          <div className="title-copy">
            <p>LIGHT ROUTE PUZZLE</p>
            <h1>光をそろえて3R勝負</h1>
            <div className="title-feature-list" aria-label="ゲーム要素">
              <span><Icon name="flashlight" label="色ライト" />色ライト</span>
              <span><Icon name="mirror-slash" label="鏡" />鏡回転</span>
              <span><Icon name="target-door" label="出口" />同色ゴール</span>
            </div>
          </div>
        </header>

        <div className="title-rules" aria-label="基本ルール">
          <span><Icon name="mirror-slash" label="鏡" />回転</span>
          <span><Icon name="beam-spark" label="光" />接続</span>
          <span><Icon name="target-door" label="出口" />ゴール</span>
        </div>

        <TitleAttractPreview settings={settings} />

        <div className="title-menu" aria-label="ゲーム設定">
          <section className="menu-panel player-panel" aria-label="プレイヤー数">
            <span className="menu-label">人数</span>
            <strong>{settings.playerCount}P</strong>
          </section>

          <section className="menu-panel mode-panel" aria-label="難易度">
            <span className="menu-label">モード</span>
            <div className="mode-grid">
              {difficultyList.map((item) => (
                <button
                  className={settings.difficulty === item.id ? 'mode-button active' : 'mode-button'}
                  aria-pressed={settings.difficulty === item.id}
                  key={item.id}
                  onClick={() => applySettings({ difficulty: item.id })}
                  aria-label={`${item.label} ${item.roundCount}ラウンド`}
                >
                  <b>{compactModeLabel(item.id, item.label)}</b>
                  <span>{item.roundCount}R / {item.boardLabel}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="menu-panel time-panel" aria-label="制限時間">
            <span className="menu-label">時間</span>
            <div className="time-grid">
              {TIME_OPTIONS.map((seconds: number) => (
                <button
                  className={settings.totalSeconds === seconds ? 'time-button active' : 'time-button'}
                  aria-pressed={settings.totalSeconds === seconds}
                  key={seconds}
                  onClick={() => applySettings({ totalSeconds: seconds })}
                  aria-label={`${seconds}秒`}
                >
                  <b>{seconds}</b>
                  <span>秒</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="title-actions">
          <button className="howto-button" onClick={() => setShowHowTo(true)}>あそび</button>
          <button className="start-button" onClick={() => onStart(settings)}>START</button>
        </div>
      </section>
    </main>
  )
}

function iconUrlForTitle() {
  return iconUrl('title-logo')
}

