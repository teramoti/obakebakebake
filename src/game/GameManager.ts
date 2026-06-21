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

function settingsEqual(a: GameSettings, b: GameSettings) {
  return a.playerCount === b.playerCount
    && a.totalSeconds === b.totalSeconds
    && a.difficulty === b.difficulty
}

function readExternalSettings(): ExternalSettings {
  if (typeof window === 'undefined') return {}
  const external = window.GameManager?.settings || window.__GAME_MANAGER_SETTINGS__ || {}
  return {
    playerCount: external.playerCount ?? external.players,
    totalSeconds: external.totalSeconds ?? external.seconds,
    difficulty: external.difficulty,
  }
}

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

/** React title screen reads this snapshot instead of keeping player count in local state. */
export function getGameSettings() {
  const normalized = normalizeSettings({ ...currentSettings, ...readExternalSettings() })
  if (!settingsEqual(normalized, currentSettings)) currentSettings = normalized
  syncWindowSettings()
  return currentSettings
}

/** Host app or StartScreen can update settings through this single entry point. */
export function setGameSettings(partialSettings: Partial<GameSettings>) {
  return publishSettings({ ...currentSettings, ...partialSettings })
}

export function subscribeGameSettings(listener: SettingsListener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getPlayerCount() {
  return getGameSettings().playerCount
}

/**
 * Starts Phaser and reports final GameResult back to React App.
 * This is the Mario-Party-like integration point: Phaser is only the mini-game body.
 */
export function startGame(
  parent: HTMLElement,
  partialSettings: Partial<GameSettings>,
  onFinish: (result: GameResult) => void,
) {
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
  })

  return game
}

export function destroyGame() {
  if (game) {
    game.destroy(true)
    game = null
  }
}

if (typeof window !== 'undefined') {
  publishSettings({ ...DEFAULT_SETTINGS, ...readExternalSettings() })
}
