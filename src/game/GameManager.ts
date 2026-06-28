/**
 * ReactとPhaserを接続する境界クラスです。
 * 設定の保持、Phaser起動、GameResultの受け渡しを担当し、外部メインゲーム連携の入口にもなります。
 */
import Phaser from 'phaser'
import MirrorPartyScene from './scenes/MirrorPartyScene.js'
import { DIFFICULTY_SETTINGS } from './data/gameConfig.js'
import type { GameResult, GameSettings } from '../app/types/game'

type SettingsListener = () => void
type ExternalSettings = Partial<GameSettings> & { players?: number; seconds?: number }

declare global {
  interface Window {
    __GAME_MANAGER_SETTINGS__?: ExternalSettings
    GameManager?: {
      settings?: ExternalSettings
      getGameSettings?: () => GameSettings
      setGameSettings?: (settings: Partial<GameSettings>) => GameSettings
      subscribeGameSettings?: (listener: SettingsListener) => () => void
    }
  }
}

const DEFAULT_SETTINGS: GameSettings = {
  playerCount: 4,
  totalSeconds: 45,
  difficulty: 'normal',
}

let currentSettings: GameSettings = { ...DEFAULT_SETTINGS }
let game: Phaser.Game | null = null
const listeners = new Set<SettingsListener>()

// 外部本体やStartScreenから来た設定値を、人数1〜4・時間30/45/60・存在する難易度へ丸めます。
function normalizeSettings(settings: Partial<GameSettings> & { players?: number; seconds?: number }): GameSettings {
  const requestedDifficulty = settings.difficulty ?? DEFAULT_SETTINGS.difficulty
  const safeDifficulty = Object.prototype.hasOwnProperty.call(DIFFICULTY_SETTINGS, requestedDifficulty)
    ? requestedDifficulty
    : DEFAULT_SETTINGS.difficulty
  const rawPlayerCount = settings.playerCount ?? settings.players
  const safePlayerCount = Number.isFinite(Number(rawPlayerCount))
    ? Math.min(4, Math.max(1, Math.round(Number(rawPlayerCount))))
    : DEFAULT_SETTINGS.playerCount
  const rawSeconds = settings.totalSeconds ?? settings.seconds
  const safeSeconds = [30, 45, 60].includes(Number(rawSeconds))
    ? Number(rawSeconds)
    : DEFAULT_SETTINGS.totalSeconds

  return {
    playerCount: safePlayerCount,
    totalSeconds: safeSeconds,
    difficulty: safeDifficulty,
  }
}

// 同じ設定で再通知しないための比較です。Reactの無限更新防止にも使います。
function settingsEqual(a: GameSettings, b: GameSettings) {
  return a.playerCount === b.playerCount
    && a.totalSeconds === b.totalSeconds
    && a.difficulty === b.difficulty
}

// 親ゲーム側がwindowへ置いた設定を読みます。未設定なら空オブジェクトにします。
function readExternalSettings(): ExternalSettings {
  if (typeof window === 'undefined') return {}
  const external = window.GameManager?.settings || window.__GAME_MANAGER_SETTINGS__ || {}
  return {
    playerCount: external.playerCount ?? external.players,
    totalSeconds: external.totalSeconds ?? external.seconds,
    difficulty: external.difficulty,
  }
}

// 現在設定をwindowへ同期し、外部本体やデバッグ画面から参照できるようにします。
function syncWindowSettings() {
  if (typeof window === 'undefined') return
  window.__GAME_MANAGER_SETTINGS__ = { ...currentSettings }
  window.GameManager = {
    ...(window.GameManager ?? {}),
    settings: { ...currentSettings },
    getGameSettings,
    setGameSettings,
    subscribeGameSettings,
  }
}

// 設定変更を保存し、値が変わった場合だけ購読者へ通知します。
function publishSettings(settings: Partial<GameSettings> & { players?: number; seconds?: number }) {
  const nextSettings = normalizeSettings(settings)
  if (settingsEqual(nextSettings, currentSettings)) {
    syncWindowSettings()
    return currentSettings
  }

  currentSettings = nextSettings
  syncWindowSettings()
  listeners.forEach((listener) => listener())
  return currentSettings
}

/** React側はローカルstateではなく、この関数から現在のゲーム設定を取得します。 */
export function getGameSettings() {
  const normalized = normalizeSettings({ ...currentSettings, ...readExternalSettings() })
  if (!settingsEqual(normalized, currentSettings)) currentSettings = normalized
  syncWindowSettings()
  return currentSettings
}

/** 外部本体またはStartScreenからの設定変更は、この入口に集約します。 */
export function setGameSettings(partialSettings: Partial<GameSettings>) {
  return publishSettings({ ...currentSettings, ...partialSettings })
}

// useSyncExternalStoreから呼ばれる購読口です。解除関数を返します。
export function subscribeGameSettings(listener: SettingsListener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// メインゲーム側が人数だけ確認したい場合の小さな取得口です。
export function getPlayerCount() {
  return getGameSettings().playerCount
}

/**
 * Phaserを起動し、ゲーム終了時にGameResultをReact側へ返します。
 * ミニゲーム本体はPhaser、画面遷移と外部連携はReact/GameManagerが担当します。
 */
export function startGame(
  parent: HTMLElement,
  partialSettings: Partial<GameSettings>,
  onFinish: (result: GameResult) => void,
  onExit?: () => void,
) {
  // 二重起動を避けるため、前のPhaserインスタンスを先に破棄します。
  destroyGame()
  const settings = setGameSettings(partialSettings)

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#070818',
    width: 1280,
    height: 720,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      antialias: true,
      roundPixels: false,
    },
    scene: [],
  })

  game.scene.add('MirrorPartyScene', MirrorPartyScene, true, {
    settings,
    onFinish,
    onExit,
  })

  return game
}

// React側がGameScreenを離れたときにPhaserを完全に破棄します。
export function destroyGame() {
  if (game) {
    game.destroy(true)
    game = null
  }
}

if (typeof window !== 'undefined') {
  publishSettings({ ...DEFAULT_SETTINGS, ...readExternalSettings() })
}
