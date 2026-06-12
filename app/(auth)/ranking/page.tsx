"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Trophy,
  Search,
  Star,
  Award,
  Medal as MedalIcon,
  Users,
  Calendar,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { UserAvatar } from "@/components/ui/user-avatar"
import { TeamFlag } from "@/components/ui/team-flag"
import { MatchGuessesDialog } from "@/components/match-guesses-dialog"
import { getRanking, getRounds, getRoundById, getMatchGuesses } from "@/lib/api"
import { getUser } from "@/lib/auth"
import type {
  RankingEntry,
  Match,
  RoundSummary,
  MatchGuessesResponse,
} from "@/lib/types"
const MEDAL_CONFIG = [
  {
    border:
      "border-amber-400/40 hover:border-amber-400/80 shadow-amber-500/5 hover:shadow-amber-500/15",
    text: "text-amber-400",
    bg: "bg-amber-400/10",
    pos: "1º",
    glow: "shadow-amber-500/5",
    cardClass:
      "order-1 md:order-2 md:scale-105 z-10 md:-translate-y-1 bg-gradient-to-b from-amber-950/20 via-slate-900/90 to-slate-950/95",
  },
  {
    border:
      "border-slate-300/30 hover:border-slate-300/70 shadow-slate-300/5 hover:shadow-slate-300/10",
    text: "text-slate-300",
    bg: "bg-slate-300/10",
    pos: "2º",
    glow: "",
    cardClass:
      "order-2 md:order-1 md:translate-y-2 bg-gradient-to-b from-slate-800/10 via-slate-900/90 to-slate-950/95",
  },
  {
    border:
      "border-amber-700/30 hover:border-amber-700/70 shadow-amber-700/5 hover:shadow-amber-700/10",
    text: "text-amber-600",
    bg: "bg-amber-600/10",
    pos: "3º",
    glow: "",
    cardClass:
      "order-3 md:order-3 md:translate-y-3 bg-gradient-to-b from-amber-900/10 via-slate-900/90 to-slate-950/95",
  },
]

type LockedMatch = Match & { round_name: string }

function isLocked(match: Match): boolean {
  const lockout = new Date(match.match_time).getTime() - 10 * 60 * 1000
  return Date.now() >= lockout
}

function formatMatchDate(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function MatchStatusBadge({ status }: { status: string }) {
  if (status === "finished")
    return (
      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-black tracking-wider text-slate-400 uppercase">
        Encerrado
      </span>
    )
  if (status === "ongoing")
    return (
      <span className="rounded-full bg-emerald-900/50 px-2 py-0.5 text-[9px] font-black tracking-wider text-emerald-400 uppercase">
        Ao vivo
      </span>
    )
  return (
    <span className="rounded-full bg-nina-wine/20 px-2 py-0.5 text-[9px] font-black tracking-wider text-nina-red uppercase">
      Bloqueado
    </span>
  )
}

function LockedMatchCard({
  match,
  onClick,
}: {
  match: LockedMatch
  onClick: () => void
}) {
  const hasResult = match.home_score !== null && match.away_score !== null

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-slate-800/60 bg-slate-900/60 p-4 text-left transition-all hover:border-slate-700/60 hover:bg-slate-900/90 hover:shadow-lg active:scale-[0.99]"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500">
          {match.round_name}
        </span>
        <MatchStatusBadge status={match.status} />
      </div>

      <div className="flex items-center gap-3">
        {/* Casa */}
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <TeamFlag
            teamName={match.home_team}
            className="h-9 w-9"
            fallbackSize="text-xs"
          />
          <span className="text-center text-[11px] leading-tight font-bold text-slate-200">
            {match.home_team}
          </span>
        </div>

        {/* Placar */}
        <div className="flex flex-col items-center gap-1">
          {hasResult ? (
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-white tabular-nums">
                {match.home_score}
              </span>
              <span className="text-base font-bold text-slate-600">×</span>
              <span className="text-2xl font-black text-white tabular-nums">
                {match.away_score}
              </span>
            </div>
          ) : (
            <span className="text-lg font-black text-slate-600">×</span>
          )}
          <div className="flex items-center gap-1 text-slate-500">
            <Calendar className="h-3 w-3" />
            <span className="text-[10px] font-medium">
              {formatMatchDate(match.match_time)}
            </span>
          </div>
        </div>

        {/* Visitante */}
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <TeamFlag
            teamName={match.away_team}
            className="h-9 w-9"
            fallbackSize="text-xs"
          />
          <span className="text-center text-[11px] leading-tight font-bold text-slate-200">
            {match.away_team}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1 text-slate-500">
        <Users className="h-3 w-3" />
        <span className="text-[10px] font-medium">
          Ver palpites dos colegas
        </span>
      </div>
    </button>
  )
}

export default function RankingPage() {
  const currentUser = getUser()
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [search, setSearch] = useState("")
  const [loadingRanking, setLoadingRanking] = useState(true)

  const [lockedMatches, setLockedMatches] = useState<LockedMatch[]>([])
  const [loadingBolao, setLoadingBolao] = useState(false)
  const [bolaoLoaded, setBolaoLoaded] = useState(false)

  const [dialogData, setDialogData] = useState<MatchGuessesResponse | null>(
    null
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loadingGuesses, setLoadingGuesses] = useState(false)

  useEffect(() => {
    getRanking()
      .then(setRanking)
      .catch((err) => console.error("Erro ao carregar ranking:", err))
      .finally(() => setLoadingRanking(false))
  }, [])

  const loadBolao = useCallback(async () => {
    if (bolaoLoaded) return
    setLoadingBolao(true)
    try {
      const rounds = await getRounds()
      const nonUpcoming = rounds.filter(
        (r: RoundSummary) => r.status !== "upcoming"
      )
      const results = await Promise.all(
        nonUpcoming.map((r: RoundSummary) => getRoundById(r.id))
      )
      const allMatches: LockedMatch[] = []
      results.forEach((res, idx) => {
        const roundName = nonUpcoming[idx].name
        res.matches.forEach((m: Match) => {
          if (isLocked(m)) {
            allMatches.push({ ...m, round_name: roundName })
          }
        })
      })
      allMatches.sort(
        (a, b) =>
          new Date(b.match_time).getTime() - new Date(a.match_time).getTime()
      )
      setLockedMatches(allMatches)
      setBolaoLoaded(true)
    } catch (err) {
      console.error("Erro ao carregar jogos do bolão:", err)
    } finally {
      setLoadingBolao(false)
    }
  }, [bolaoLoaded])

  async function openMatchGuesses(matchId: number) {
    setLoadingGuesses(true)
    setDialogOpen(true)
    setDialogData(null)
    try {
      const data = await getMatchGuesses(matchId)
      setDialogData(data)
    } catch (err) {
      console.error("Erro ao carregar palpites:", err)
      setDialogOpen(false)
    } finally {
      setLoadingGuesses(false)
    }
  }

  const filtered = ranking.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const podium = ranking.slice(0, 3)

  if (loadingRanking) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-nina-red border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-4xl animate-in space-y-6 duration-300 fade-in">
        {/* Page header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800/60 pb-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-amber-600/5 shadow-lg shadow-amber-500/5">
              <Trophy className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Ranking Geral
              </h1>
              <p className="text-xs font-medium text-slate-400">
                Acompanhe a liderança em tempo real do nosso bolão
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="ranking">
          <TabsList className="mb-2 h-10 w-full rounded-xl border border-slate-800/60 bg-slate-900/60 p-1">
            <TabsTrigger
              value="ranking"
              className="flex-1 rounded-lg text-xs font-bold tracking-wide uppercase data-[state=active]:bg-slate-800 data-[state=active]:text-white"
            >
              Classificação
            </TabsTrigger>
            <TabsTrigger
              value="bolao"
              className="flex-1 rounded-lg text-xs font-bold tracking-wide uppercase data-[state=active]:bg-slate-800 data-[state=active]:text-white"
              onClick={() => loadBolao()}
            >
              Bolão
            </TabsTrigger>
          </TabsList>

          {/* Aba: Classificação */}
          <TabsContent value="ranking" className="space-y-8">
            {/* Pódio visual */}
            {podium.length > 0 && !search && (
              <div className="space-y-4">
                <h2 className="px-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Pódio do Torneio
                </h2>
                <section className="grid grid-cols-1 gap-6 pb-4 md:grid-cols-3 md:gap-4 md:pb-8">
                  {podium.map((user, idx) => {
                    const cfg = MEDAL_CONFIG[idx]
                    const isFirst = idx === 0
                    return (
                      <Card
                        key={user.user_id}
                        className={`group relative cursor-pointer border backdrop-blur-md transition-all duration-300 hover:scale-[1.02] ${cfg.cardClass} ${cfg.border} shadow-xl ${cfg.glow}`}
                      >
                        <div
                          className={`absolute top-4 right-4 text-xs font-black ${cfg.bg} ${cfg.text} flex items-center gap-1 rounded-full border border-current/20 px-3 py-1 shadow-sm`}
                        >
                          {isFirst ? (
                            <Star className="h-3 w-3 animate-pulse fill-amber-400 text-amber-400" />
                          ) : (
                            <Award className="h-3 w-3" />
                          )}
                          {cfg.pos} Lugar
                        </div>

                        <CardContent className="mt-4 flex flex-col items-center gap-4 p-6 text-center">
                          <div className="relative">
                            <UserAvatar
                              avatarUrl={user.avatar_url}
                              name={user.name}
                              size={80}
                              className={`border-2 shadow-xl transition-all duration-300 group-hover:scale-105 ${cfg.border}`}
                            />
                            <div className="absolute -right-1 -bottom-1 rounded-full border border-slate-800 bg-slate-900 p-1.5 shadow-md">
                              <Trophy className={`h-4.5 w-4.5 ${cfg.text}`} />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <h3 className="flex max-w-[200px] items-center justify-center gap-1 truncate text-base font-black tracking-tight text-white">
                              {user.name}
                            </h3>
                            <p className="max-w-[210px] truncate text-xs font-medium text-slate-400/90">
                              {user.email}
                            </p>
                          </div>

                          <div className="mt-2 flex w-full items-center justify-between rounded-xl border border-slate-900/60 bg-slate-950/60 px-4 py-2.5 shadow-inner">
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                              Pontuação
                            </span>
                            <div className="flex items-baseline gap-1">
                              <span
                                className={`text-2xl font-black ${cfg.text}`}
                              >
                                {user.total_points}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 uppercase">
                                pts
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </section>
              </div>
            )}

            {/* Busca */}
            <div className="relative">
              <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar participante pelo nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-xl border-slate-800/80 bg-slate-900/80 pr-4 pl-10 text-xs text-white placeholder-slate-500 transition-all hover:border-slate-700/60 focus:border-nina-wine"
              />
            </div>

            {/* Tabela completa */}
            <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-xl backdrop-blur-md">
              <CardHeader className="border-b border-slate-800/60 bg-slate-950/30 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-black tracking-wider text-slate-200 uppercase">
                      Classificação Completa
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs font-medium text-slate-400">
                      Atualizado automaticamente após o apito final de cada jogo
                    </CardDescription>
                  </div>
                  <MedalIcon className="h-5 w-5 text-slate-500" />
                </div>
              </CardHeader>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-950/40">
                    <TableRow className="border-slate-800/60 hover:bg-transparent">
                      <TableHead className="w-[80px] text-center text-xs font-bold text-slate-300">
                        Posição
                      </TableHead>
                      <TableHead className="w-[60px]" />
                      <TableHead className="text-xs font-bold text-slate-300">
                        Participante
                      </TableHead>
                      <TableHead className="w-[140px] pr-8 text-right text-xs font-bold text-slate-300">
                        Pontuação
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((user) => {
                      const isTop3 = user.position <= 3
                      const isMe = user.user_id === currentUser?.id
                      return (
                        <TableRow
                          key={user.user_id}
                          className={`group border-slate-800/60 transition-colors duration-200 hover:bg-slate-900/30 ${
                            isMe
                              ? "border-l-4 border-l-nina-red bg-nina-wine/15 hover:bg-nina-wine/25"
                              : "border-l-4 border-l-transparent"
                          }`}
                        >
                          <TableCell className="text-center text-sm font-black">
                            {isTop3 ? (
                              <span
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-black shadow-sm ${
                                  user.position === 1
                                    ? "border border-amber-400/30 bg-amber-400/20 text-amber-400 shadow-amber-500/5"
                                    : user.position === 2
                                      ? "border border-slate-300/30 bg-slate-300/20 text-slate-300"
                                      : "border border-amber-600/30 bg-amber-600/20 text-amber-600"
                                }`}
                              >
                                {user.position}
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-slate-400">
                                {user.position}º
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="p-2">
                            <UserAvatar
                              avatarUrl={user.avatar_url}
                              name={user.name}
                              size={36}
                              className="border border-nina-wine/30 shadow-sm transition-all group-hover:border-nina-red/30"
                            />
                          </TableCell>

                          <TableCell className="py-3.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="block text-sm font-bold text-slate-100 transition-colors group-hover:text-white">
                                {user.name}
                                {isMe && (
                                  <span className="ml-2 rounded-full bg-nina-red px-2 py-0.5 text-[9px] font-black tracking-wider text-white uppercase shadow-sm">
                                    Você
                                  </span>
                                )}
                              </span>
                              <span className="text-xs font-medium text-slate-400">
                                {user.email}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="pr-8 text-right text-sm font-black text-slate-100">
                            <span className="rounded-lg border border-slate-800/40 bg-slate-950/40 px-3 py-1.5 text-white shadow-inner group-hover:bg-slate-950/70">
                              {user.total_points}{" "}
                              <span className="ml-0.5 text-[10px] font-bold text-slate-500 uppercase">
                                pts
                              </span>
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}

                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="py-12 text-center text-sm font-medium text-slate-400"
                        >
                          Nenhum participante encontrado com os termos
                          pesquisados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>
          </TabsContent>

          {/* Aba: Bolão */}
          <TabsContent value="bolao">
            {loadingBolao ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-nina-red border-t-transparent" />
              </div>
            ) : lockedMatches.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-2 text-slate-500">
                <Users className="h-8 w-8 opacity-40" />
                <span className="text-sm font-medium">
                  Nenhum jogo bloqueado ainda.
                </span>
                <span className="text-xs text-slate-600">
                  Os palpites dos colegas aparecem aqui após o bloqueio de cada
                  partida.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="px-1 text-xs font-medium text-slate-500">
                  {lockedMatches.length}{" "}
                  {lockedMatches.length === 1
                    ? "jogo bloqueado"
                    : "jogos bloqueados"}{" "}
                  — clique para ver os palpites
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {lockedMatches.map((match) => (
                    <LockedMatchCard
                      key={match.id}
                      match={match}
                      onClick={() => openMatchGuesses(match.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de palpites */}
      <MatchGuessesDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        data={loadingGuesses ? null : dialogData}
        currentUserId={currentUser?.id}
      />

      {/* Loading overlay no dialog */}
      {loadingGuesses && dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-nina-red border-t-transparent" />
            <span className="text-xs font-medium text-slate-400">
              Carregando palpites...
            </span>
          </div>
        </div>
      )}
    </>
  )
}
