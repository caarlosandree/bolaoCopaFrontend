import { getToken } from "./auth"
import type {
  ActiveRoundResponse,
  AdminMatchesPage,
  AdvanceMethod,
  AuthResponse,
  BolaoStats,
  BracketData,
  CopaOverview,
  GroupStandings,
  MatchDetails,
  MatchGuessesResponse,
  RankingEntry,
  RoundSummary,
  SyncLogEntry,
  SyncResultsResult,
  SyncScheduleResult,
  User,
} from "./types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:1323"

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error ?? `Erro ${res.status}`)
  }
  return data as T
}

async function requestRaw<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error ?? `Erro ${res.status}`)
  }
  return data as T
}

// Auth
export function register(name: string, email: string, password: string) {
  return request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  })
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

// Rodadas
export function getRounds() {
  return request<RoundSummary[]>("/api/rounds")
}

export function getRoundById(id: number) {
  return request<ActiveRoundResponse>(`/api/rounds/${id}`)
}

// Rodada ativa
export function getActiveRound() {
  return request<ActiveRoundResponse>("/api/rounds/active")
}

export function getMatchDetails(matchId: number) {
  return request<MatchDetails>(`/api/matches/${matchId}/details`)
}

// Palpites
export function saveGuess(
  match_id: number,
  home_guess: number,
  away_guess: number,
  advancing_team?: "home" | "away" | null,
  advance_method?: AdvanceMethod | null
) {
  const payload: Record<string, unknown> = { match_id, home_guess, away_guess }
  if (advancing_team) payload.advancing_team = advancing_team
  if (advance_method) payload.advance_method = advance_method
  return request<{ message: string }>("/api/guesses", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

// Ranking
export function getRanking() {
  return request<RankingEntry[]>("/api/ranking")
}

// Admin: lançar placar
export function updateMatchScore(
  matchId: number,
  home_score: number,
  away_score: number
) {
  return request<{
    message: string
    match_id: number
    score: { home: number; away: number }
  }>(`/api/admin/matches/${matchId}/score`, {
    method: "POST",
    body: JSON.stringify({ home_score, away_score }),
  })
}

// Admin: definir resultado de mata-mata (quem avança + método)
export function updateKnockoutResult(
  matchId: number,
  winner_team: "home" | "away",
  advance_method: AdvanceMethod
) {
  return request<{
    message: string
    match_id: number
    winner_team: "home" | "away"
    advance_method: AdvanceMethod
    recalculated: number
  }>(`/api/admin/matches/${matchId}/knockout`, {
    method: "POST",
    body: JSON.stringify({ winner_team, advance_method }),
  })
}

// Admin: sync manual
export function syncSchedule() {
  return request<SyncScheduleResult>("/api/admin/sync/schedule", {
    method: "POST",
  })
}

export function syncResults() {
  return request<SyncResultsResult>("/api/admin/sync/results", {
    method: "POST",
  })
}

export function resetSchedule() {
  return request<SyncScheduleResult>("/api/admin/sync/reset-schedule", {
    method: "POST",
  })
}

export function activateRound(roundId: number) {
  return request<{ message: string; round_id: number }>(
    `/api/admin/rounds/${roundId}/activate`,
    {
      method: "POST",
    }
  )
}

export function syncMatchDetails() {
  return request<{
    message: string
    schedule_imported: number
    details_updated: number
    failures: string[]
  }>("/api/admin/sync/match-details", { method: "POST" })
}

export function syncStreams() {
  return request<{ message: string }>("/api/admin/sync/streams", {
    method: "POST",
  })
}

export function getAdminMatches(page = 1, pageSize = 12) {
  return request<AdminMatchesPage>(
    `/api/admin/matches?page=${page}&page_size=${pageSize}`
  )
}

export function getSyncLogs(scope: "schedule" | "results", limit = 30) {
  return request<SyncLogEntry[]>(
    `/api/admin/sync/logs?scope=${scope}&limit=${limit}`
  )
}

// Perfil do usuário autenticado
export function getMe() {
  return request<User>("/api/me")
}

export function uploadAvatar(file: File) {
  const form = new FormData()
  form.append("avatar", file)
  return requestRaw<{ avatar_url: string }>("/api/me/avatar", {
    method: "POST",
    body: form,
  })
}

// Admin: listar usuários
export function getAdminUsers() {
  return request<User[]>("/api/admin/users")
}

export function updateUserHidden(userId: number, isHidden: boolean) {
  return request<{ message: string; user_id: number; is_hidden: boolean }>(
    `/api/admin/users/${userId}/hidden`,
    {
      method: "PATCH",
      body: JSON.stringify({ is_hidden: isHidden }),
    }
  )
}

// Admin: excluir usuário (remove palpites em cascata)
export function deleteAdminUser(userId: number) {
  return request<{ message: string; user_id: number }>(
    `/api/admin/users/${userId}`,
    { method: "DELETE" }
  )
}

// Estatísticas
export function getCopaOverview() {
  return request<CopaOverview>("/api/statistics/copa")
}

export function getGroupStandings() {
  return request<GroupStandings>("/api/statistics/groups")
}

export function getBracket() {
  return request<BracketData>("/api/statistics/bracket")
}

export function getBolaoStats() {
  return request<BolaoStats>("/api/statistics/bolao")
}

export function getMatchGuesses(matchId: number) {
  return request<MatchGuessesResponse>(`/api/matches/${matchId}/guesses`)
}
