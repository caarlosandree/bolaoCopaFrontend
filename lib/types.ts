export type UserRole = "admin" | "user"

export type User = {
  id: number
  name: string
  email: string
  role: UserRole
  total_points: number
  avatar_url: string | null
  created_at: string
}

export type AuthResponse = {
  token: string
  user: User
}

export type Round = {
  id: number
  tournament_id: number
  number: number
  name: string
  status: "upcoming" | "active" | "finished"
  created_at: string
}

export type UserGuess = {
  id?: number
  home_guess: number
  away_guess: number
  points_earned?: number
}

export type Match = {
  id: number
  round_id: number
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  status: "scheduled" | "ongoing" | "finished"
  match_time: string
  group_name?: string | null
  venue?: string | null
  user_guess?: UserGuess | null
}

export type ActiveRoundResponse = {
  round: Round | null
  matches: Match[]
}

export type RankingEntry = {
  position: number
  user_id: number
  name: string
  email: string
  total_points: number
  avatar_url: string | null
}

export type AdminMatch = {
  id: number
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  status: "scheduled" | "ongoing" | "finished"
  match_time: string
  round_name: string
  group_name: string | null
}

export type SyncScheduleResult = {
  message: string
  imported: number
}

export type SyncResultsResult = {
  message: string
  linked: number
  scores_updated: number
  scores_skipped: number
}
