/**
 * React側の画面遷移を管理するルートコンポーネントです。
 * StartScreenで設定を作り、GameScreenへ渡し、GameManager経由のGameResultをResultScreenへ渡します。
 */
import { Suspense, lazy, useCallback, useState } from 'react'
import StartScreen from './screens/StartScreen/StartScreen'
import ResultScreen from './screens/ResultScreen/ResultScreen'
import type { GameResult, GameSettings } from './types/game'

const GameScreen = lazy(() => import('./screens/GameScreen/GameScreen'))

type Screen = 'start' | 'game' | 'result'

/**
 * App owns only screen flow.
 * Phaser runs inside GameScreen and returns GameResult through GameManager.ts.
 */
// Start/Game/Resultの三画面だけを管理し、Phaser内部には直接触りません。
export default function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const [settings, setSettings] = useState<GameSettings | null>(null)
  const [result, setResult] = useState<GameResult | null>(null)

  const handleStart = useCallback((nextSettings: GameSettings) => {
    setSettings(nextSettings)
    setResult(null)
    setScreen('game')
  }, [])

  const handleFinish = useCallback((nextResult: GameResult) => {
    setResult(nextResult)
    setScreen('result')
  }, [])

  const handleBack = useCallback(() => {
    setSettings(null)
    setResult(null)
    setScreen('start')
  }, [])

  if (screen === 'game' && settings) {
    return (
      <Suspense fallback={<main className="app loading-shell">ゲーム読み込み中...</main>}>
        <GameScreen settings={settings} onFinish={handleFinish} />
      </Suspense>
    )
  }

  if (screen === 'result' && result) {
    return <ResultScreen result={result} onBack={handleBack} />
  }

  return <StartScreen onStart={handleStart} />
}
