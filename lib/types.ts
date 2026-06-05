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
  thesportsdb_event_id?: string | null
  thesportsdb_home_team_id?: string | null
  thesportsdb_away_team_id?: string | null
  odds_api_event_id?: string | null
  api_football_fixture_id?: string | null
  user_guess?: UserGuess | null
}

export type SourceStatus = {
  source: string
  section: string
  status: "success" | "partial" | "failed" | "unavailable"
  message?: string
  synced_at?: string
}

export type MatchDetailsAvailability = {
  odds: boolean
  predictions: boolean
  form: boolean
  h2h: boolean
  lineups: boolean
  statistics: boolean
  injuries: boolean
  events: boolean
  media: boolean
}

export type MatchDetails = {
  match_id: number
  availability: MatchDetailsAvailability
  odds: unknown | null
  predictions: unknown | null
  recent_form: unknown | null
  head_to_head: unknown | null
  lineups: unknown | null
  statistics: unknown | null
  injuries: unknown | null
  events: unknown | null
  media: unknown | null
  source_status: SourceStatus[]
  last_synced_at: string | null
  lineups_synced_at: string | null
  updated_at: string | null
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
