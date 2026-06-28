/**
 * React画面、GameManager、Phaser Sceneの間で共有する型定義です。
 * 設定値とResultの形をここに寄せ、外部連携時のデータ構造を確認しやすくします。
 */
export type DifficultyId = 'easy' | 'normal' | 'hard'

export type GameSettings = {
  playerCount: number
  totalSeconds: number
  difficulty: DifficultyId
}

export type ScoreBreakdown = {
  clear?: number
  time?: number
  move?: number
  crystals?: number
  mission?: number
  perfect?: number
  event?: number
  live?: number
  rule?: number
  color?: number
  split?: number
  ghosts?: number
}

export type RouteSnapshot = {
  cells: { x: number; y: number; color?: string }[]
  lines: { from: { x: number; y: number }; to: { x: number; y: number }; color?: string }[]
}

export type TurnStageResult = {
  round: number
  stageId: string
  stageName: string
  baseStageName?: string
  remixLabel?: string
  score: number
  cleared: boolean
  rotations: number
  maxMoves: number
  movesLeft: number
  crystals: number
  ghosts: number
  remaining: number
  eventId?: string
  eventLabel?: string
  matchedEmitters?: number
  requiredEmitters?: number
  usedSplitter?: boolean
  breakdown?: ScoreBreakdown
  routeSnapshot?: RouteSnapshot
}

export type PlayerResult = {
  player: number
  playerIndex: number
  rank: number
  score: number
  clears: number
  perfects: number
  missions: number
  crystals: number
  ghosts: number
  rotations: number
  movesLeft: number
  winReason?: string
  bestRound?: {
    round: number
    score: number
    cleared: boolean
  } | null
  stages: TurnStageResult[]
}

export type GameResult = {
  results: PlayerResult[]
  settings: GameSettings
  roundCount: number
  summary: {
    averageScore: number
    totalClears: number
    totalMissions: number
    totalMovesLeft: number
    roundCount: number
  }
}
