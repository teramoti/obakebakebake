export type DifficultyId = 'easy' | 'normal' | 'hard'

export type GameSettings = {
  playerCount: number
  totalSeconds: number
  difficulty: DifficultyId
}

export type TurnStageResult = {
  round: number
  stageId: string
  stageName: string
  score: number
  cleared: boolean
  rotations: number
  maxMoves: number
  movesLeft: number
  crystals: number
  ghosts: number
  remaining: number
  eventLabel?: string
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
