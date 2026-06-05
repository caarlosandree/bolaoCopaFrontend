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

export type RoundSummary = {
  id: number
  tournament_id: number
  number: number
  name: string
  status: "upcoming" | "active" | "finished"
  match_count: number
  first_match_at: string | null
  last_match_at: string | null
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

export type AdminMatchesPage = {
  items: AdminMatch[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export type SyncLogEntry = {
  occurred_at: string
  action: string
  status_code: number
  outcome: string
  path: string
  metadata: Record<string, unknown>
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

// ==========================================
// Statistics types
// ==========================================

export type BiggestWin = {
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  match_time: string
}

export type TopScorer = {
  player: string
  team: string
  goals: number
  badge: string
}

export type NextMatch = {
  home_team: string
  away_team: string
  home_badge: string
  away_badge: string
  match_time: string
  round: string
  group?: string
  venue?: string
}

export type CopaOverview = {
  total_goals: number
  biggest_win: BiggestWin | null
  top_scorer: TopScorer | null
  next_matches: NextMatch[]
}

export type TeamStanding = {
  name: string
  badge: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  gd: number
  points: number
}

export type Group = {
  name: string
  teams: TeamStanding[]
}

export type GroupStandings = {
  groups: Group[]
}

export type BracketTeam = {
  name: string
  badge: string
  score: number | null
}

export type BracketMatch = {
  id: string
  home: BracketTeam
  away: BracketTeam
  status: "scheduled" | "ongoing" | "finished"
  match_time: string
  slot: number
}

export type BracketRounds = {
  r32: BracketMatch[]
  r16: BracketMatch[]
  qf: BracketMatch[]
  sf: BracketMatch[]
  final: BracketMatch[]
  third: BracketMatch[]
}

export type BracketData = {
  rounds: BracketRounds
}

export type BestRound = {
  name: string
  total_points: number
}

export type BolaoOverview = {
  total_guesses: number
  exact_hits: number
  hit_rate: number
  best_round: BestRound | null
}

export type RoundPoint = {
  round: number
  cumulative_points: number
}

export type UserEvolution = {
  user: string
  avatar_url: string | null
  points: RoundPoint[]
}

export type GuessDistribution = {
  score: string
  count: number
}

export type AccuracyRow = {
  name: string
  avatar_url: string | null
  exact: number
  partial: number
  wrong: number
  total: number
  rate: number
}

export type BolaoStats = {
  overview: BolaoOverview
  points_evolution: UserEvolution[]
  guess_distribution: GuessDistribution[]
  accuracy_ranking: AccuracyRow[]
}
