/**
 * React画面内にPhaserキャンバスをマウントするゲーム画面です。
 * ゲーム本体の進行はGameManagerとPhaser Sceneへ任せ、ここでは開始・破棄・Result返却だけを扱います。
 */
import { useEffect, useRef } from 'react'
import { destroyGame, startGame } from '../../../game/GameManager'
import type { GameResult, GameSettings } from '../../types/game'
import './GameScreen.css'

type Props = {
  settings: GameSettings
  onFinish: (result: GameResult) => void
}

/**
 * React side wrapper for the Phaser mini game.
 * The GameManager owns Phaser creation and returns GameResult to App when all players finish.
 */
// Phaserのmount/unmountだけを担当し、ゲーム本体のロジックはGameManagerへ任せます。
export default function GameScreen({ settings, onFinish }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!hostRef.current) return undefined

    startGame(hostRef.current, settings, onFinish)

    return () => {
      destroyGame()
    }
  }, [settings, onFinish])

  return (
    <main className="app game-shell">
      <div className="phaser-host" ref={hostRef} />
    </main>
  )
}
